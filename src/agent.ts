import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFile } from "fs/promises";
import { z } from "zod";
import { DatabaseConfig, DatabaseType, IDatabaseAdapter } from "./types.js";
import { DatabaseManager } from "./database/database_manager.js";
import { Embedder } from "./embedder/embedder.js";
import { QDrant_Db } from "./vector_db/qd.js";
import { LocalMdReader } from "./filereader/md_filereader.js";

// ── DB singleton ──────────────────────────────────────────────────────────────
let dbInstance: IDatabaseAdapter | null = null;

const getDb = async (): Promise<IDatabaseAdapter> => {
    if (dbInstance) return dbInstance;

    const dbConfig: DatabaseConfig = {
        host: "localhost",
        port: 5432,
        database: "testerp",
        username: "postgres",
        password: "owl",
        ssl: false,
        maxConnection: 10,
        connectionTimeOut: 10000,
    };

    const dbManager = DatabaseManager.getinstance();

    if (dbManager.hasConnection("default")) {
        dbInstance = dbManager.getConnection("default");
    } else {
        dbInstance = await dbManager.addConnection("default", DatabaseType.PostgreSQL, dbConfig);
    }

    return dbInstance;
};

// ── Qdrant + Embedder singletons ──────────────────────────────────────────────
let qdrantInstance: QDrant_Db | null = null;
let embedderInstance: Embedder | null = null;

const getQdrant = (): QDrant_Db => {
    if (qdrantInstance) return qdrantInstance;
    qdrantInstance = new QDrant_Db({
        url:            "http://localhost:6333",
        collectionname: "my_wiki",
        size:           1536,
    });
    return qdrantInstance;
};

const getEmbedder = (): Embedder => {
    if (embedderInstance) return embedderInstance;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set");
    embedderInstance = new Embedder(apiKey);
    return embedderInstance;
};

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new McpServer({
    name: "MyAgent",
    version: "1.0.0",
});

// ── Tool 1: Calculator ────────────────────────────────────────────────────────
server.tool(
    "calculate",
    { expression: z.string().describe("Math expression, e.g. '2 + 2 * 10'") },
    async ({ expression }) => {
        try {
            const result = Function(`"use strict"; return (${expression})`)();
            return { content: [{ type: "text", text: `Result: ${result}` }] };
        } catch {
            return { content: [{ type: "text", text: "Error: invalid expression" }] };
        }
    }
);

// ── Tool 2: Read file ─────────────────────────────────────────────────────────
server.tool(
    "read_file",
    { path: z.string().describe("Absolute path to a file") },
    async ({ path }) => {
        try {
            const content = await readFile(path, "utf-8");
            return { content: [{ type: "text", text: content }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }] };
        }
    }
);

// ── Tool 3: HTTP fetch ────────────────────────────────────────────────────────
server.tool(
    "http_get",
    { url: z.string().url().describe("URL to fetch") },
    async ({ url }) => {
        const res  = await fetch(url);
        const text = await res.text();
        return { content: [{ type: "text", text: text.slice(0, 3000) }] };
    }
);

// ── Tool 4: Query Database ────────────────────────────────────────────────────
server.registerTool(
    "query_database",
    {
        description: "Use this tool to execute a SQL query against the PostgreSQL database and return results as a formatted table. Call this whenever the user asks to query, fetch, retrieve, or look up data from the database.",
        inputSchema: z.object({
            sql:    z.string().describe("SQL query to execute, e.g. 'SELECT * FROM users LIMIT 10'"),
            params: z.array(z.any()).optional().describe("Optional parameterized values, e.g. [42, 'active']"),
        }),
    },
    async ({ sql, params }) => {
        try {
            const db     = await getDb();
            const result = await db.query(sql, params);

            if (result.rows.length === 0) {
                return { content: [{ type: "text", text: "Query returned no rows." }] };
            }

            const headers   = result.fields ?? Object.keys(result.rows[0] as object);
            const rows      = result.rows.map((row: any) =>
                headers.map((h) => String(row[h] ?? "NULL")).join(" | ")
            );
            const headerLine = headers.join(" | ");
            const separator  = headers.map((h) => "-".repeat(h.length)).join("-|-");
            const table      = [headerLine, separator, ...rows].join("\n");

            return {
                content: [{ type: "text", text: `Rows returned: ${result.rowCount}\n\n${table}` }],
            };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Database error: ${e.message}` }] };
        }
    }
);

// ── Tool 5: Semantic search over wiki (Qdrant) ────────────────────────────────
server.registerTool(
    "search_wiki",
    {
        description: `Use this tool to search the internal knowledge base (wiki) using semantic search.
Call this when the user asks about:
- documented concepts, features, or requirements
- anything that might be in internal markdown documentation
- questions like "what does X do", "how does Y work", "find info about Z"
Returns the most relevant sections from the wiki with source file attribution.`,
        inputSchema: z.object({
            query: z.string().describe(
                "Natural language search query, e.g. 'how are PMs scheduled by meter' or 'what are the security requirements'"
            ),
            limit: z.number().min(1).max(20).default(5).describe(
                "Number of results to return (default: 5)"
            ),
        }),
    },
    async ({ query, limit }) => {
        try {
            const embedder = getEmbedder();
            const qdrant   = getQdrant();

            // embed the query using the same model used during ingestion
            const vector  = await embedder.embedText(query);

            // search Qdrant
            const context = await qdrant.search(vector, limit);

            if (!context) {
                return {
                    content: [{ type: "text", text: "No relevant results found in the wiki." }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: `Found ${limit} relevant sections for: "${query}"\n\n${context}`,
                }],
            };

        } catch (e: any) {
            return {
                content: [{ type: "text", text: `Wiki search error: ${e.message}` }],
            };
        }
    }
);

// ── Tool 6: Ingest markdown docs into wiki ────────────────────────────────────
server.registerTool(
    "ingest_wiki",
    {
        description: "Ingest markdown files from a directory into the Qdrant vector database. Call this when the user wants to index new documentation or update the knowledge base.",
        inputSchema: z.object({
            docsDir: z.string().describe(
                "Absolute or relative path to the directory containing .md files to ingest"
            ),
        }),
    },
    async ({ docsDir }) => {
        try {
            // lazy import to keep server startup fast
            const { randomUUID }    = await import("crypto");

            const reader   = new LocalMdReader(docsDir, 4);
            const embedder = getEmbedder();
            const qdrant   = getQdrant();

            await qdrant.ensureCollection();

            const BATCH_SIZE = 20;
            const buffer: any[] = [];
            let totalChunks = 0;

            // stable deterministic ID — re-running ingest updates, not duplicates
            const stableId = (sourceFile: string, heading: string, level: number) => {
                const raw  = `${sourceFile}::${heading}::${level}`;
                let hash   = 5381;
                for (let i = 0; i < raw.length; i++) {
                    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
                    hash = hash >>> 0;
                }
                return `${hash.toString(16).padStart(8, "0")}-${raw.length.toString(16).padStart(4, "0")}-0000-0000-000000000000`;
            };

            const flush = async () => {
                if (buffer.length === 0) return;
                const vectors = await embedder.embedBatch(buffer);
                const items   = buffer.map((chunk, i) => ({
                    id:     stableId(chunk.sourceFile, chunk.heading, chunk.level),
                    vector: vectors[i],
                    chunk,
                }));
                await qdrant.upsertManyChunks(items);
                buffer.length = 0;
            };

            for await (const chunk of reader.readAll()) {
                buffer.push(chunk);
                totalChunks++;
                if (buffer.length >= BATCH_SIZE) await flush();
            }
            await flush();

            return {
                content: [{
                    type: "text",
                    text: `✓ Ingestion complete — ${totalChunks} chunks indexed from "${docsDir}"`,
                }],
            };

        } catch (e: any) {
            return {
                content: [{ type: "text", text: `Ingestion error: ${e.message}` }],
            };
        }
    }
);

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MyAgent MCP server running...");
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
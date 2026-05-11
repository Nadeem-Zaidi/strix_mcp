import OpenAI from "openai";
import path from "path";
import { Chunk, QDConfig } from "../types.js";
import { LocalMdReader } from "../filereader/md_filereader.js";
import { QDrant_Db } from "../vector_db/qd.js";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const DOCS_DIR = "./src/documents";
const EMBEDDING_MODEL = "text-embedding-3-small";
const VECTOR_SIZE = 1536;
const QDRANT_URL = "http://localhost:6333";
const COLLECTION_NAME = "my_wiki";

const PIPELINE_BATCH = 20;


export class Embedder {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = EMBEDDING_MODEL) {
        if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async embed(chunk: Chunk): Promise<number[]> {
        const text = this.chunkToText(chunk);
        const res = await this.client.embeddings.create({
            model: this.model,
            input: text,
        });
        return res.data[0].embedding;
    }
    async embedBatch(chunks: Chunk[]): Promise<number[][]> {
        const inputs = chunks.map(c => this.chunkToText(c));
        const res = await this.client.embeddings.create({
            model: this.model,
            input: inputs,
        });
        return res.data.map(d => d.embedding);
    }


    private chunkToText(chunk: Chunk): string {
        let text = "";

        if (chunk.heading) {
            text += `Section: ${chunk.heading}\n`;
        }

        text += chunk.content;

        for (const cb of chunk.codeBlocks) {
            text += `\nCode (${cb.lang}):\n${cb.value}\n`;
        }

        return text.trim();
    }

    async embedText(text: string): Promise<number[]> {
        const res = await this.client.embeddings.create({
            model: this.model,
            input: text,
        });
        return res.data[0].embedding;
    }
}

async function ingest(docsDir: string): Promise<void> {
    if (!OPENAI_API_KEY) {
        throw new Error("Set OPENAI_API_KEY environment variable before running");
    }

    const reader = new LocalMdReader(docsDir, 4);
    const embedder = new Embedder(OPENAI_API_KEY);
    const db = new QDrant_Db({
        url: QDRANT_URL,
        collectionname: COLLECTION_NAME,
        size: VECTOR_SIZE,
    } satisfies QDConfig);

    await db.ensureCollection();

    let totalChunks = 0;
    let totalBatches = 0;
    const buffer: Chunk[] = []; 

    async function flushBuffer(): Promise<void> {
        if (buffer.length === 0) return;
        const vectors = await embedder.embedBatch(buffer);

        // 2. upsert all into Qdrant
        const items = buffer.map((chunk, i) => ({
            vector: vectors[i],
            chunk,
            id: stableId(chunk),
        }));

        await db.upsertManyChunks(items);

        totalBatches++;
        console.log(
            `[pipeline] batch ${totalBatches} → ` +
            `${buffer.length} chunks upserted ` +
            `(total so far: ${totalChunks})`
        );

        buffer.length = 0;
    }

    for await (const chunk of reader.readAll()) {
        buffer.push(chunk);
        totalChunks++;


        if (buffer.length >= PIPELINE_BATCH) {
            await flushBuffer();
        }
    }

    await flushBuffer();

    console.log(`\n✓ ingestion complete — ${totalChunks} chunks across ${totalBatches} batches`);
}


function stableId(chunk: Chunk): string {
    const raw = `${chunk.sourceFile}::${chunk.heading}::${chunk.level}`;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
        hash = hash >>> 0; 
    }
    return `${hash.toString(16).padStart(8, "0")}-${raw.length.toString(16).padStart(4, "0")}-0000-0000-000000000000`;
}

async function search(query: string): Promise<void> {
    const embedder = new Embedder(OPENAI_API_KEY);
    const db = new QDrant_Db({
        url: QDRANT_URL,
        collectionname: COLLECTION_NAME,
        size: VECTOR_SIZE,
    });

    const vector = await embedder.embed({
        heading: "", level: 0, content: query,
        codeBlocks: [], tables: [], sourceFile: ""
    });

    const context = await db.search(vector, 5);

    console.log("\n── Search results ──────────────────────────────");
    console.log(context);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    if (command === "ingest") {
        await ingest(arg ?? DOCS_DIR);

    } else if (command === "search") {
        if (!arg) throw new Error("Usage: npm run dev search <query>");
        await search(arg);

    } else {
        // default: just ingest
        await ingest(DOCS_DIR);
    }
}

main().catch(console.error);
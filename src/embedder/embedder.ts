import OpenAI from "openai";
import path from "path";
import { Chunk, QDConfig } from "../types.js";
import { LocalMdReader } from "../filereader/md_filereader.js";
import { QDrant_Db } from "../vector_db/qd.js";
import dotenv from "dotenv";
dotenv.config();


// ─── Config ───────────────────────────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const DOCS_DIR = "./src/documents";
const EMBEDDING_MODEL = "text-embedding-3-small";
const VECTOR_SIZE = 1536;
const QDRANT_URL = "http://localhost:6333";
const COLLECTION_NAME = "my_wiki";

// how many chunks to embed + upsert in one go
// keeps memory low and avoids OpenAI rate limits
const PIPELINE_BATCH = 20;

// ─── Embedder ─────────────────────────────────────────────────────────────────

export class Embedder {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = EMBEDDING_MODEL) {
        if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    // embed a single chunk — builds the text the same way every time
    async embed(chunk: Chunk): Promise<number[]> {
        const text = this.chunkToText(chunk);
        const res = await this.client.embeddings.create({
            model: this.model,
            input: text,
        });
        return res.data[0].embedding;
    }

    // embed a batch of chunks in one API call (much cheaper on rate limits)
    async embedBatch(chunks: Chunk[]): Promise<number[][]> {
        const inputs = chunks.map(c => this.chunkToText(c));
        const res = await this.client.embeddings.create({
            model: this.model,
            input: inputs,
        });
        // OpenAI returns embeddings in the same order as inputs
        return res.data.map(d => d.embedding);
    }

    // single source of truth for what text gets embedded
    private chunkToText(chunk: Chunk): string {
        let text = "";

        if (chunk.heading) {
            text += `Section: ${chunk.heading}\n`;
        }

        text += chunk.content;

        // include code blocks as plain text so code is searchable
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


// ─── Pipeline ─────────────────────────────────────────────────────────────────

async function ingest(docsDir: string): Promise<void> {
    if (!OPENAI_API_KEY) {
        throw new Error("Set OPENAI_API_KEY environment variable before running");
    }

    // initialise all three components
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
    const buffer: Chunk[] = []; // accumulate chunks before sending to OpenAI

    // helper: flush whatever is in the buffer to OpenAI + Qdrant
    async function flushBuffer(): Promise<void> {
        if (buffer.length === 0) return;

        // 1. embed the whole buffer in one OpenAI call
        const vectors = await embedder.embedBatch(buffer);

        // 2. upsert all into Qdrant
        const items = buffer.map((chunk, i) => ({
            vector: vectors[i],
            chunk,
            // deterministic ID: sourceFile + heading — safe to re-run (idempotent)
            id: stableId(chunk),
        }));

        await db.upsertManyChunks(items);

        totalBatches++;
        console.log(
            `[pipeline] batch ${totalBatches} → ` +
            `${buffer.length} chunks upserted ` +
            `(total so far: ${totalChunks})`
        );

        buffer.length = 0; // clear without reallocating
    }

    // stream chunks from all .md files
    for await (const chunk of reader.readAll()) {
        buffer.push(chunk);
        totalChunks++;

        // once buffer hits batch size, flush to OpenAI + Qdrant
        if (buffer.length >= PIPELINE_BATCH) {
            await flushBuffer();
        }
    }

    // flush any remaining chunks that didn't fill a full batch
    await flushBuffer();

    console.log(`\n✓ ingestion complete — ${totalChunks} chunks across ${totalBatches} batches`);
}

// ─── Stable ID ────────────────────────────────────────────────────────────────
// deterministic UUID-like string from sourceFile + heading
// so re-running ingest updates existing points instead of duplicating them

function stableId(chunk: Chunk): string {
    const raw = `${chunk.sourceFile}::${chunk.heading}::${chunk.level}`;
    // simple djb2 hash → hex string (good enough for Qdrant string IDs)
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
        hash = hash >>> 0; // keep unsigned 32-bit
    }
    return `${hash.toString(16).padStart(8, "0")}-${raw.length.toString(16).padStart(4, "0")}-0000-0000-000000000000`;
}

// ─── Search helper (test it after ingestion) ──────────────────────────────────

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
    const command = process.argv[2]; // "ingest" or "search"
    const arg = process.argv[3]; // docs dir or query string

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
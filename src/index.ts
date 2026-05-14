import path from "path";
import { LocalMdReader } from "./filereader/md_filereader.js";
import { Embedder } from "./embedder/embedder.js";
import { QDrant_Db } from "./vector_db/qd.js";

import dotenv from "dotenv";
dotenv.config();

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
    openaiKey: process.env.OPENAI_API_KEY ?? "",
    docsDir: "./src/documents",
    qdrantUrl: "http://localhost:6333",
    collectionName: "knowledge_base",
    vectorSize: 1536,
    batchSize: 20,
    workers: 4,
};



function stableId(sourceFile: string, heading: string, level: number): string {
    const raw = `${sourceFile}::${heading}::${level}`;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
        hash = hash >>> 0;
    }
    return `${hash.toString(16).padStart(8, "0")}-${raw.length.toString(16).padStart(4, "0")}-0000-0000-000000000000`;
}

// ─── Ingest ───────────────────────────────────────────────────────────────────
async function ingest(): Promise<void> {
    if (!CONFIG.openaiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    console.log("── Starting ingestion ───────────────────────────");
    console.log(`   docs dir   : ${CONFIG.docsDir}`);
    console.log(`   collection : ${CONFIG.collectionName}`);
    console.log(`   batch size : ${CONFIG.batchSize}`);
    console.log("─────────────────────────────────────────────────\n");

    // ── init ──────────────────────────────────────────────────────────────────
    const reader = new LocalMdReader(CONFIG.docsDir);
    const embedder = new Embedder(CONFIG.openaiKey);
    const db = new QDrant_Db({
        url: CONFIG.qdrantUrl,
        collectionname: CONFIG.collectionName,
        size: CONFIG.vectorSize,
    });

    await db.ensureCollection();

    // ── stream → batch → embed → upsert ──────────────────────────────────────
    let totalChunks = 0;
    let totalBatches = 0;
    const buffer: Awaited<ReturnType<typeof reader.readAll> extends AsyncGenerator<infer T> ? Promise<T[]> : never> extends never ? any[] : any[] = [];

    async function flush() {
        if (buffer.length === 0) return;
        const vectors = await embedder.embedBatch(buffer);
        const items = buffer.map((chunk, i) => ({
            id: stableId(chunk.sourceFile, chunk.heading, chunk.level),
            vector: vectors[i],
            chunk,
        }));
        await db.upsertManyChunks(items);

        totalBatches++;
        console.log(
            `[ingest] batch ${totalBatches} flushed — ` +
            `${buffer.length} chunks (running total: ${totalChunks})`
        );

        buffer.length = 0;
    }

    for await (const chunk of reader.readAll()) {
        buffer.push(chunk);
        totalChunks++;

        if (buffer.length >= CONFIG.batchSize) {
            await flush();
        }
    }

    await flush();

    console.log(`\n✓ ingestion complete`);
    console.log(`  total chunks  : ${totalChunks}`);
    console.log(`  total batches : ${totalBatches}`);
}



// ─── Search ───────────────────────────────────────────────────────────────────



// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case "ingest":
            if (arg) CONFIG.docsDir = arg;
            await ingest();
            break;

        // case "search":
        //     if (!arg) throw new Error("Usage: npm run dev search \"your query\"");
        //     await search(arg);
        //     break;

        default:
            await ingest();
    }
}

main().catch((err) => {
    console.error("[fatal]", err);
    // process.exit(1);
});
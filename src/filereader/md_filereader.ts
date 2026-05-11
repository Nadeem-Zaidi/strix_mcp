import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import fs from "fs/promises";
import path from "path";
import { Chunk } from "../types.js";

// ─── Types ────────────────────────────────────────────────────────────────────



// ─── LocalMdReader ────────────────────────────────────────────────────────────

export class LocalMdReader {
    private readonly dirPath: string;
    private readonly workerCount: number;

    constructor(dirPath: string, workerCount: number = 4) {
        this.dirPath = dirPath;
        this.workerCount = workerCount;
    }

    // ── Public entry point ───────────────────────────────────────────────────

    async *readAll(): AsyncGenerator<Chunk> {
        const mdFiles = await this.collectFiles();

        if (mdFiles.length === 0) {
            console.warn(`[LocalMdReader] no .md files found in "${this.dirPath}"`);
            return;
        }

        console.log(`[LocalMdReader] found ${mdFiles.length} file(s), workers: ${this.workerCount}`);

        yield* this.streamChunks(mdFiles);
    }

    // ── File collection ──────────────────────────────────────────────────────

    private async collectFiles(): Promise<string[]> {
        const entries = await fs.readdir(this.dirPath, { withFileTypes: true });
        return entries
            .filter(e => e.isFile() && e.name.endsWith(".md"))
            .map(e => path.join(this.dirPath, e.name));
    }

    // ── Producer / consumer stream ───────────────────────────────────────────

    private async *streamChunks(mdFiles: string[]): AsyncGenerator<Chunk> {
        const fileQueue = [...mdFiles];
        const chunkQueue: Chunk[] = [];
        let done = false;
        let notify: (() => void) | null = null;

        // wake() clears notify BEFORE calling it — prevents double-fire
        const wake = () => {
            const n = notify;
            notify = null;
            n?.();
        };

        const push = (chunk: Chunk) => {
            chunkQueue.push(chunk);
            wake();
        };

        // workers run concurrently, each popping files until queue is exhausted
        const workersPromise = Promise.all(
            Array.from({ length: this.workerCount }, () => this.worker(fileQueue, push))
        ).then(() => {
            done = true;
            wake();
        });

        // consumer: yield chunks as they arrive from any worker
        while (!done || chunkQueue.length > 0) {
            if (chunkQueue.length > 0) {
                yield chunkQueue.shift()!;
            } else if (!done) {
                await new Promise<void>(r => { notify = r; });
            }
        }

        await workersPromise;
    }

    // ── Worker: reads one file at a time ─────────────────────────────────────

    private async worker(
        fileQueue: string[],
        push: (chunk: Chunk) => void
    ): Promise<void> {
        while (true) {
            const filePath = fileQueue.shift();
            if (!filePath) break;

            try {
                const content = await fs.readFile(filePath, "utf-8");
                const tree = unified()
                    .use(remarkParse)
                    .use(remarkGfm)
                    .parse(content);

                let chunkCount = 0;
                for (const chunk of this.buildChunks(tree, filePath)) {
                    push(chunk);
                    chunkCount++;
                }

                console.log(`[worker] "${path.basename(filePath)}" → ${chunkCount} chunks`);

            } catch (err) {
                console.error(`[worker] failed on "${filePath}":`, err);
                // swallow per-file errors so other files still process
            }
        }
    }

    // ── Chunk generator (no intermediate array) ───────────────────────────────

    private *buildChunks(tree: any, sourceFile: string): Generator<Chunk> {
        let current: Chunk = this.emptyChunk(sourceFile);

        for (const node of tree.children) {
            switch (node.type) {
                case "heading": {
                    const flushed = this.flush(current);
                    if (flushed) yield flushed;
                    current = {
                        ...this.emptyChunk(sourceFile),
                        heading: this.extractNode(node),
                        level: node.depth,
                    };
                    break;
                }

                case "paragraph": {
                    current.content += this.extractNode(node) + "\n";
                    break;
                }

                case "code": {
                    current.codeBlocks.push({
                        lang: node.lang || "",
                        value: node.value,
                    });
                    break;
                }

                case "list": {
                    current.content += this.extractList(node) + "\n";
                    break;
                }

                case "table": {
                    const parsed = this.extractTable(node);
                    current.tables.push(parsed);
                    const headerLine = parsed.headers.join(" | ");
                    const rowLines   = parsed.rows.map(r => r.join(" | ")).join("\n");
                    current.content += `Table: ${headerLine}\n${rowLines}\n`;
                    break;
                }

                case "blockquote": {
                    const quoteText = node.children
                        .map((c: any) => this.extractNode(c))
                        .join(" ");
                    current.content += `> ${quoteText}\n`;
                    break;
                }

                case "html": {
                    current.content += node.value.replace(/<[^>]+>/g, "").trim() + "\n";
                    break;
                }

                case "thematicBreak": {
                    const flushed = this.flush(current);
                    if (flushed) yield flushed;
                    current = this.emptyChunk(sourceFile);
                    break;
                }

                case "definition":
                case "footnoteDefinition":
                case "yaml":
                    break;

                default:
                    console.warn(`[buildChunks] unhandled node type: "${node.type}"`);
            }
        }

        const last = this.flush(current);
        if (last) yield last;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private emptyChunk(sourceFile: string): Chunk {
        return { heading: "", level: 0, content: "", codeBlocks: [], tables: [], sourceFile };
    }

    private flush(current: Chunk): Chunk | null {
        if (current.content.trim() || current.codeBlocks.length > 0 || current.tables.length > 0) {
            return { ...current };
        }
        return null;
    }

    private extractNode(node: any): string {
        if (node.type === "text" || node.type === "inlineCode") return node.value;
        if (["strong", "emphasis", "delete"].includes(node.type)) {
            return node.children?.map((c: any) => this.extractNode(c)).join("") ?? "";
        }
        if (node.type === "link") {
            const text = node.children?.map((c: any) => this.extractNode(c)).join("") ?? "";
            return node.url ? `${text} (${node.url})` : text;
        }
        if (!node.children) return "";
        return node.children.map((c: any) => this.extractNode(c)).join("");
    }

    private extractTable(node: any): { headers: string[]; rows: string[][] } {
        const [headerRow, ...dataRows] = node.children;
        const headers = headerRow.children.map((cell: any) =>
            cell.children?.map((c: any) => this.extractNode(c)).join("").trim() ?? ""
        );
        const rows = dataRows.map((row: any) =>
            row.children.map((cell: any) =>
                cell.children?.map((c: any) => this.extractNode(c)).join("").trim() ?? ""
            )
        );
        return { headers, rows };
    }

    private extractList(node: any, depth = 0): string {
        let result = "";
        for (const item of node.children) {
            const indent = "  ".repeat(depth);
            for (const child of item.children) {
                if (child.type === "paragraph") {
                    result += `${indent}- ${this.extractNode(child)}\n`;
                } else if (child.type === "list") {
                    result += this.extractList(child, depth + 1);
                }
            }
        }
        return result;
    }
}


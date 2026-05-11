import { DatabaseConfig, DatabaseType, IDatabaseAdapter } from "../types.js";
import { DatabaseFactory } from "./database_factory.js";

export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections: Map<string, IDatabaseAdapter> = new Map();
    private constructor() { };
    static getinstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async addConnection(name: string, type: DatabaseType, config: DatabaseConfig): Promise<IDatabaseAdapter> {
        if (this.connections.has(name)) {
            throw new Error(`Connection with name "${name}" already exists`);
        }
        const adapter = await DatabaseFactory.createAndConnect(type, config)
        this.connections.set(name, adapter);
        return adapter;
    }
    getConnection(name: string): IDatabaseAdapter {
        const connection = this.connections.get(name);
        if (!connection) {
            throw new Error(`Connection with name "${name}" not found`);
        }
        return connection;
    }
    async closeAll(): Promise<void> {
        const promises = Array.from(this.connections.values()).map(conn =>
            conn.disconnect()
        );
        await Promise.all(promises);
        this.connections.clear();
    }
    getConnectionCount(): number {
        return this.connections.size;
    }
    hasConnection(name: string): boolean {
        return this.connections.has(name);
    }
    async removeConnection(name: string): Promise<void> {
        const connection = this.connections.get(name);
        if (connection) {
            await connection.disconnect();
            this.connections.delete(name);
        }
    }
}
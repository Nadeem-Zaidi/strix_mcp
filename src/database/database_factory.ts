import { DatabaseConfig, DatabaseType, IDatabaseAdapter } from "../types.js";
import { PostgreAdapter } from "./database_adapters/postgreadapter.js";

export class DatabaseFactory{
    static createAdapter(type:DatabaseType,config:DatabaseConfig){
        switch(type){
            case DatabaseType.PostgreSQL:
                return new PostgreAdapter(config);
            
            default:
                throw new Error(`Unsupported database type :${type}`);
        }
    }
    static async createAndConnect(type:DatabaseType,config:DatabaseConfig):Promise<IDatabaseAdapter>{
        const adapter=DatabaseFactory.createAdapter(type,config);
        await adapter.connect();
        return adapter;


    }
}
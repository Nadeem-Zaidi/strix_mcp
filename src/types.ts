export interface DatabaseConfig{
    host:string;
    port:number;
    database:string;
    username:string;
    password:string;
    ssl?:boolean;
    connectionTimeOut?:number;
    maxConnection?:number;
}

export interface QueryResult<T=any>{
    rows:T[];
    rowCount:number;
    fields?:string[];
}

export interface IDatabaseAdapter{
    connect():Promise<void>
    disconnect():Promise<void>
    query<T=any>(sql:string,params?:any[]):Promise<QueryResult<T>>;
    beginTransaction():Promise<void>;
    commit():Promise<void>;
    rollback():Promise<void>;
    isConnected():boolean;
    getType():string;

}

export enum DatabaseType{
    MySQL='mysql',
    PostgreSQL='postgresql',
    Oracle='oracle'
}

export interface Chunk {
    heading: string;
    level: number;
    content: string;
    codeBlocks: { lang: string; value: string }[];
    tables: { headers: string[]; rows: string[][] }[];
    sourceFile: string;
}




export interface QDConfig {
    url: string;
    size: number;
    collectionname: string;
}
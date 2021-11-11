import { Connection, getConnection, QueryBuilder, QueryRunner } from 'typeorm';

export class ParsedRepository {
    private table: string;
    private connection: Connection;
    private queryRunner: QueryRunner;

    constructor(table: string) {
        this.table = table;
        this.connection = getConnection();
        this.queryRunner = this.connection.createQueryRunner();
    }

    public async getAll(): Promise<any[]> {
        try {
            await this.queryRunner.connect();
            const query = `
                SELECT * FROM ${this.table}
                WHERE deleted_at IS NULL;
            `;
            return await this.queryRunner.query(query);
        } catch (e) {
            console.error(e);
        }
    }

    public async getById(id: string): Promise<any> {
        const query = `
            SELECT * FROM ${this.table}
            WHERE id = '${id}';
        `;
        return await this.queryRunner.query(query);
    }

    public async getByArgs(args): Promise<[]> {
        const where = Object.keys(args).map((k) => {
            return `"${k}" = '${args[k]}'`;
        }).join(' AND ');
        const query = `
            SELECT * FROM ${this.table}
            ${where !== '' ? `WHERE ${where}` : ''};
        `;
        return await this.queryRunner.query(query);
    }

    // public async close(): Promise<void> {
    //     return await this.connection.close();
    // }
}
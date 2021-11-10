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

    public async getById(id: string): Promise<[]> {
        const query = `
            SELECT * FROM ${this.table}
            WHERE id = '${id}';
        `;
        return await this.queryRunner.query(query);
    }
}
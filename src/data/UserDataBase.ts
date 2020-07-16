import knex from 'knex';
import { BaseDatabase } from './BaseDatabase';

export class UserDatabase extends BaseDatabase {
    private static tableName = String(process.env.MAIN_TABLE);
    
    public async create(id: string, name: string, email: string, password: string) {
        try {
            await this.getConnection()
                .insert(
                    {
                        id,
                        name,
                        email,
                        password
                    }
                ).into(UserDatabase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    };
};
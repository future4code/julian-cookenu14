import knex from 'knex';
import { BaseDatabase } from './BaseDatabase';

export class UserDataBase extends BaseDatabase {
    private static tableName = String(process.env.MAIN_TABLE);
    
    public async createUser(id: string, name: string, email: string, password: string) {
        try {
            await this.getConnection()
                .insert(
                    {
                        id,
                        name,
                        email,
                        password
                    }
                ).into(UserDataBase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    };
};
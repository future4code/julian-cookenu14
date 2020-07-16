import { BaseDatabase } from './BaseDatabase';

export class UserDatabase extends BaseDatabase {
    private static tableName = "User";
    
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

    public async getByEmail(email: string): Promise<any> {
        const result = await this.getConnection()
            .select('*')
            .from(UserDatabase.tableName)
            .where({email});

        return result[0];
    };

    public async getById(id: string): Promise<any> {
        const result = await this.getConnection()
            .select("*")
            .from(UserDatabase.tableName)
            .where({ id });

        return result[0];
    };
};
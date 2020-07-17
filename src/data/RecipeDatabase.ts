import { BaseDatabase } from './BaseDatabase';

export class RecipeDatabase extends BaseDatabase {
    private static tableName = "Recipe";
        
    public async create(id: string, title: string, description: string, userId: string) {
        try {
            await this.getConnection()
                .insert(
                    {
                        id,
                        title,
                        description,
                        user_id: userId 
                    }
                ).into(RecipeDatabase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    };

    public async getById(id: string): Promise<any> {
        const result = await this.getConnection()
            .select("*")
            .from(RecipeDatabase.tableName)
            .where({ id });

        return result[0];
    };
};
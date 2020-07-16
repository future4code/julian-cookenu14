import { BaseDatabase } from './BaseDatabase';

export class RecipeDatabase extends BaseDatabase {
    private static tableName = "Recipe";
        
    public async create(id: string, title: string, description: string, date: string, userId: string) {
        try {
            await this.getConnection()
                .insert(
                    {
                        id,
                        title,
                        description,
                        date,
                        user_id: userId 
                    }
                ).into(RecipeDatabase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    };
};
import { BaseDatabase } from './BaseDatabase';

export class FollowDatabase extends BaseDatabase {
    private static tableName = "Follow";
    
    public async create(followerId: string, followedId: string) {
        try {
            await this.getConnection()
                .insert(
                    {
                        follower_id: followerId,
                        followed_id: followedId
                    }
                ).into(FollowDatabase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    };

    public async delete(followerId: string, followedId: string) {
        try {
            await this.getConnection()
                .where({
                    follower_id: followerId,
                    followed_id: followedId
                })
                .del()
                .into(FollowDatabase.tableName);

            BaseDatabase.destroyConnection();

        } catch (error) {
            throw new Error(error.sqlMessage || error.message);
        }
    }
};
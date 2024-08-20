import Follower from '@/schemas/follower.schema';
import databaseService from '@/services/database.service';
import { ObjectId } from 'mongodb';

class FollowerService {
    private static instance: FollowerService;

    private constructor() {}

    public static getInstance(): FollowerService {
        if (!FollowerService.instance) {
            FollowerService.instance = new FollowerService();
        }

        return FollowerService.instance;
    }

    public async isFollowBefore(payload: { followed_user_id: string; user_id: string }) {
        const response = await databaseService.followers.findOne({
            followed_user_id: new ObjectId(payload.followed_user_id),
            user_id: new ObjectId(payload.user_id)
        });

        return response;
    }

    public async follow(payload: { followed_user_id: string; user_id: string }) {
        const response = await databaseService.followers.insertOne(
            new Follower({
                followed_user_id: new ObjectId(payload.followed_user_id),
                user_id: new ObjectId(payload.user_id)
            })
        );

        return response;
    }

    public async unfollow(payload: { followed_user_id: string; user_id: string }) {
        await databaseService.followers.deleteOne({
            followed_user_id: new ObjectId(payload.followed_user_id),
            user_id: new ObjectId(payload.user_id)
        });

        return {
            message: 'Unfollow user success'
        };
    }
}

// Export
const followerService = FollowerService.getInstance();
export default followerService;

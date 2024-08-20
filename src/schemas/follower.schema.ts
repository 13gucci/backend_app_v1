import { ObjectId } from 'mongodb';

interface iFollower {
    _id?: ObjectId;
    user_id: ObjectId;
    followed_user_id: ObjectId;
    created_at?: Date;
}

export default class Follower {
    _id: ObjectId;
    user_id: ObjectId;
    followed_user_id: ObjectId;
    created_at: Date;

    constructor(follower: iFollower) {
        this._id = follower._id || new ObjectId();
        this.user_id = follower.user_id;
        this.created_at = follower.created_at || new Date();
        this.followed_user_id = follower.followed_user_id;
    }
}

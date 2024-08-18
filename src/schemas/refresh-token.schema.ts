import { ObjectId } from 'mongodb';

interface iRefreshToken {
    _id?: ObjectId;
    token: string;
    created_at?: Date;
    user_id: ObjectId;
}

export class RefreshToken {
    _id?: ObjectId;
    token: string;
    created_at?: Date;
    user_id: ObjectId;

    constructor({ token, _id, created_at, user_id }: iRefreshToken) {
        this._id = _id || new ObjectId();
        this.created_at = created_at || new Date();
        this.token = token;
        this.user_id = user_id;
    }
}

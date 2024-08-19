import { ObjectId } from 'mongodb';

interface iBlackList {
    _id?: ObjectId;
    token: string;
    created_at?: Date;
}

export default class BlackList {
    _id: ObjectId;
    token: string;
    created_at: Date;

    constructor(item: iBlackList) {
        this._id = item._id || new ObjectId();
        this.token = item.token;
        this.created_at = item.created_at || new Date();
    }
}

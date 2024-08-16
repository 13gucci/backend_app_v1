import { ObjectId } from 'mongodb';

const DEFAULT_STRING = '' as const;

enum eUserVerifyStatus {
    Unverified,
    Verified,
    Banned
}

interface iUser {
    _id?: ObjectId;
    name: string;
    email: string;
    date_of_birth: Date;
    password: string;
    created_at?: Date;
    updated_at?: Date;
    email_verify_token?: string;
    forgot_password_token?: string;
    verify?: eUserVerifyStatus;
    bio?: string;
    location?: string;
    website?: string;
    username?: string;
    avatar?: string;
    cover_photo?: string;
}

export default class User {
    _id: ObjectId;
    name: string;
    email: string;
    date_of_birth: Date;
    password: string;
    created_at: Date;
    updated_at: Date;
    email_verify_token: string;
    forgot_password_token: string;
    verify: eUserVerifyStatus;
    bio: string;
    location: string;
    website: string;
    username: string;
    avatar: string;
    cover_photo: string;

    constructor(user: iUser) {
        const current_time = new Date();

        this._id = user._id || new ObjectId();
        this.name = user.name || DEFAULT_STRING;
        this.email = user.email;
        this.date_of_birth = user.date_of_birth || current_time;
        this.password = user.password;
        this.created_at = user.created_at || current_time;
        this.updated_at = user.updated_at || current_time;
        this.email_verify_token = user.email_verify_token || DEFAULT_STRING;
        this.forgot_password_token = user.forgot_password_token || DEFAULT_STRING;
        this.verify = user.verify || eUserVerifyStatus.Unverified;
        this.bio = user.bio || DEFAULT_STRING;
        this.location = user.location || DEFAULT_STRING;
        this.website = user.website || DEFAULT_STRING;
        this.username = user.username || DEFAULT_STRING;
        this.avatar = user.avatar || DEFAULT_STRING;
        this.cover_photo = user.avatar || DEFAULT_STRING;
    }
}

import { GoogleUserRes, OAuthRes } from '@/@types/response.type';
import { eTokenType } from '@/@types/token.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import User, { eUserVerifyStatus } from '@/schemas/user.schema';
import databaseService from '@/services/database.service';
import refreshTokenService from '@/services/refresh-token.service';
import usersService from '@/services/users.service';
import axios from 'axios';
import { ObjectId } from 'mongodb';

class GoogleService {
    private static instance: GoogleService;

    private constructor() {}

    public static getInstance(): GoogleService {
        if (!GoogleService.instance) {
            GoogleService.instance = new GoogleService();
        }
        return GoogleService.instance;
    }

    private async getGoogleUserInfo(payload: { access_token: string; id_token: string }) {
        const { data } = await axios.get<GoogleUserRes>(process.env.GOOGLE_USER_INFO_URL as string, {
            params: {
                access_token: payload.access_token,
                alt: 'json'
            },
            headers: {
                Authorization: `Bearer ${payload.id_token}`
            }
        });

        return data;
    }

    private async getOauthGoogleToken(payload: { code: string }) {
        const body = {
            code: payload.code,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            grant_type: 'authorization_code'
        };

        // Fetch id_token & access_token from Googleapis by code
        const { data } = await axios.post<OAuthRes>(process.env.GOOGLE_OAUTH_TOKEN_URL as string, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return data;
    }

    public async oauth(payload: { code: string }) {
        // Query Google API to get id_token & access_token
        const response = await this.getOauthGoogleToken({ code: payload.code });
        const { access_token: google_access_token, expires_in, id_token, scope } = response;

        // Query Google Api to get user information
        const user_info = await this.getGoogleUserInfo({ access_token: google_access_token, id_token });
        const { email, family_name, given_name, hd, id, name, picture, verified_email } = user_info;

        if (!verified_email) {
            throw new ErrorMessageCode({
                code: hc.BAD_REQUEST,
                message: authMsg.FAILURE.GMAIL_UNVERIFY
            });
        }

        // Check existed email
        const user = await usersService.emailExists({ email });

        // If already exist
        if (user) {
            const [access_token, refresh_token] = await Promise.all([
                usersService.signToken({
                    exp: process.env.EXP_ACCESS_TOKEN,
                    private_key: process.env.ACCESS_PRIVATE_KEY as string,
                    my_payload: {
                        user_id: user._id.toString(),
                        token_type: eTokenType.ACCESS_TOKEN,
                        verify: eUserVerifyStatus.Verified
                    },
                    sub: user._id.toString()
                }),
                usersService.signToken({
                    exp: process.env.EXP_REFRESH_TOKEN,
                    private_key: process.env.REFRESH_PRIVATE_KEY as string,
                    my_payload: {
                        user_id: user._id.toString(),
                        token_type: eTokenType.REFRESH_TOKEN,
                        verify: eUserVerifyStatus.Verified
                    },
                    sub: user._id.toString()
                })
            ]);

            await refreshTokenService.createRefreshToken({
                token_string: refresh_token,
                user_id: user._id.toString()
            });

            return {
                access_token,
                refresh_token,
                newUser: false
            };
        }

        // Else create new
        const user_id = new ObjectId();
        const random_password = Math.random().toString(36).substring(2, 15);

        await databaseService.users.insertOne(
            new User({
                _id: user_id,
                email: email,
                avatar: picture,
                name: name,
                password: random_password,
                date_of_birth: new Date(),
                verify: eUserVerifyStatus.Verified
            })
        );

        const [access_token, refresh_token] = await Promise.all([
            usersService.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.ACCESS_PRIVATE_KEY as string,
                my_payload: {
                    user_id: user_id.toString(),
                    token_type: eTokenType.ACCESS_TOKEN,
                    verify: eUserVerifyStatus.Verified
                },
                sub: user_id.toString()
            }),
            usersService.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.REFRESH_PRIVATE_KEY as string,
                my_payload: {
                    user_id: user_id.toString(),
                    token_type: eTokenType.REFRESH_TOKEN,
                    verify: eUserVerifyStatus.Verified
                },
                sub: user_id.toString()
            })
        ]);

        await refreshTokenService.createRefreshToken({
            token_string: refresh_token,
            user_id: user_id.toString()
        });

        return {
            access_token,
            refresh_token,
            newUser: true
        };
    }
}

const googleService = GoogleService.getInstance();
export default googleService;

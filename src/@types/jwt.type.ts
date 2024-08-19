export type tJWTPayload = {
    token_type: number;
    iat: number;
    exp: number;
    aud: string;
    iss: string;
    sub: string;
    jti: string;
};

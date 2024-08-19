// JWT = base64encoded(header) +.+ base64encoded(payload) +.+ base64safe(hmac(_, secret))

import { tJWTPayload } from '@/@types/jwt.type';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { assign } from 'lodash';

// Access Token Structure:
// iss: nơi phát hành
// exp: thời hạn hết hạn
// aud: nơi được cung cấp token
// sub: subject
// iat: thời gian tạo
// jti: uuid

export const signTokenString = ({
    privateKey,
    payload,
    options
}: {
    payload: string | Buffer | object;
    privateKey: Secret;
    options: SignOptions;
}) => {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, privateKey, options, function (err, token) {
            if (err) {
                throw reject(err);
            }
            resolve(token as string);
        });
    });
};

export const verifyTokenString = ({ token, privateKey }: { token: string; privateKey: Secret }) => {
    return new Promise<jwt.JwtPayload>((resolve, reject) => {
        jwt.verify(token, privateKey, { ignoreExpiration: false }, function (err, decoded) {
            if (err) {
                reject(err);
            }
            resolve(decoded as jwt.JwtPayload);
        });
    });
};

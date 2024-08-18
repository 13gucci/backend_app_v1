// JWT = base64encoded(header) +.+ base64encoded(payload) +.+ base64safe(hmac(_, secret))

import jwt, { SignOptions, Secret } from 'jsonwebtoken';

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

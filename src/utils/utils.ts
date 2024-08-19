import hc from '@/constants/http-status-codes';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import bcrypt from 'bcrypt';

export const generateHashPassword = ({
    myPlaintextPassword,
    saltRounds = Number(process.env.SALT_ROUNDS)
}: {
    myPlaintextPassword: string;
    saltRounds?: number;
}) => {
    return new Promise<string>((resolve, reject) => {
        bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    });
};

export const comparePassword = (myPlaintextPassword: string, hash: string) => {
    return bcrypt
        .compare(myPlaintextPassword, hash)
        .then((result) => result)
        .catch(() => false);
};

export const validateBearerToken = (token: string) => {
    const parts = token.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: validationMsg.INVALID_TOKEN
        });
    }

    const tokenValue = parts[1];

    if (!tokenValue || tokenValue.length === 0) {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: validationMsg.INVALID_TOKEN
        });
    }

    return tokenValue;
};

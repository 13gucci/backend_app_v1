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

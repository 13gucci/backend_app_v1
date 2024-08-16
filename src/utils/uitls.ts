import bcrypt from 'bcrypt';

export const generateHashPass = (myPlaintextPassword: string, saltRounds: number) => {
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
    return new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(myPlaintextPassword, hash).then(function (result) {
            if (result) {
                resolve(true);
            }
            reject(false);
        });
    });
};

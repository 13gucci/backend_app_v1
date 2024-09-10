export type OAuthRes = {
    access_token: string;
    expires_in: number;
    id_token: string;
    scope: string;
};

export type GoogleUserRes = {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    hd: string;
};

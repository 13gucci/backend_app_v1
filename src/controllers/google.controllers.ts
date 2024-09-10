import { OauthReqQueries } from '@/@types/request.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import googleService from '@/services/google.service';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export const oauthController = async (
    req: Request<ParamsDictionary, unknown, unknown, OauthReqQueries>,
    res: Response,
    next: NextFunction
) => {
    const { authuser, code, hd, prompt, scope } = req.query;

    const response = await googleService.oauth({ code });

    const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK as string}?access_token=${response.access_token}&refresh_token=${response.refresh_token}&new_user=${response.newUser}`;

    return res.redirect(urlRedirect);
};

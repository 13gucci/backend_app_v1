import hc from '@/constants/http-status-codes';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import path from 'path';

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({
        uploadDir: path.resolve('uploads'),
        maxFiles: 1, //Số file có thể upload lên server
        keepExtensions: true, //Dữ đuôi file
        maxFileSize: 300 * 1024 // 300Kb, dung lượng file
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return next(
                new ErrorMessageCode({
                    code: hc.BAD_REQUEST,
                    message: err.message
                })
            );
        }
        return res.json({ fields, files });
    });
};

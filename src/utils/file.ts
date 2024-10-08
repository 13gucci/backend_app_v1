import fs from 'fs';
import path from 'path';

export const initFolder = () => {
    const uploadFolderPath = path.resolve('uploads');
    if (fs.existsSync(uploadFolderPath)) {
        return;
    }
    fs.mkdirSync(uploadFolderPath, {
        recursive: true // Mục đích là tạo folder nested
    });
};

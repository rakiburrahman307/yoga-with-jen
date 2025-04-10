import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const handleChunkVideoUpload = async (req: Request, res: Response) => {
    const chunk = req.file;
    const { originalname, chunkIndex, totalChunks } = req.body;

    const uploadDir = path.join(__dirname, '../../uploads/videos');
    const filePath = path.join(uploadDir, originalname);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    fs.appendFileSync(filePath, fs.readFileSync(chunk?.path as string));

    fs.unlinkSync(chunk?.path as string);

    if (chunk) {
        if (Number(chunkIndex) + 1 === Number(totalChunks)) {
            res.json({
                status: 'completed',
                message: 'File uploaded successfully!',
                videoUrl: `/videos/${originalname}`,
            });
        } else {
            res.json({ status: 'chunkReceived', message: 'Chunk received!' });
        }
    } else {
        res.status(400).json({ status: 'error', message: 'No chunk received' });
    }
};
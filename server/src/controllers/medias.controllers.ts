import { NextFunction, Request, Response } from "express";
import path from "path";
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/message";
import mediasService from "~/services/medias.services";
import fs from "fs";
import mime from 'mime'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req);
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req);
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};
export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      return res.status((err as any).status).send("Not found");
    }
  });
};
export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range;
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send("Requires Range header");
  }
  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
  // 1MB = 10^6 bytes
  // Còn nếu tính theo hệ phị phân thì 1MB = 2^20 bytes
  // Dung lượng video
  const videoSize = fs.statSync(videoPath).size;
  // Dung lượn video cho mỗi phân đoạn stream
  const CHUNK_SIZE = 10 ** 6; // 1MB
  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=0-1000000)
  const start = Number(range.replace(/\D/g, ""));
  // Lấy giá trị byte kết thúc từ header Range (vd: bytes=0-1000000), vượt quá dung lượng thì lấy giá trị cuối cùng của video
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường thì đây là chunk size, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || "video/*";
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  };
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};

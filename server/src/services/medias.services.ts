import { Request } from "express";
import path from "path";
import sharp from "sharp";
import { UPLOAD_IMAGE_DIR } from "~/constants/dir";
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from "~/utils/file";
import fs from "fs";
import { config } from "dotenv";
import { isProduction } from "~/constants/config";
import { MediaType } from "~/constants/enums";
import { Media } from "~/models/Other";
import { uploadFileToS3 } from "~/utils/s3";
import mime from "mime";
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import fsPromise from "fs/promises";
config();

class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);
    console.log("files", files)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename);
        const newFullFileName = `${newName}.jpg`;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName);
        // Delete the original uploaded image from the temporary folder
        await sharp(file.filepath).jpeg().toFile(newPath);
        const s3Result = await uploadFileToS3({
          filename: "images/" + newFullFileName,
          filepath: newPath,
          contentType: mime.getType(newFullFileName) as string,
          // contentType: "image/jpeg",
        });
        // await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)]);

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image,
        };
        // fs.unlinkSync(file.filepath);
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFileName}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`,
        //   type: MediaType.Image,
        // };
      }),
    );
    return result;
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req);
    console.log("files", files)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: "videos/" + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath,
        });
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video,
        };
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video,
        // };
      }),
    );
    return result;
  }
}
const mediasService = new MediaService();
export default mediasService;

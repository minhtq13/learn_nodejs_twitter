import { Request } from "express";
import path from "path";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/dir";
import { getNameFromFullName, handleUploadSingleImage } from "~/utils/file";
import fs from "fs";
import { config } from "dotenv";
import { isProduction } from "~/constants/config";
config();

class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    const newName = getNameFromFullName(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    // Delete the original uploaded image from the temporary folder
    await sharp(file.filepath).jpeg().toFile(newPath)
    // fs.unlinkSync(file.filepath);
    return isProduction
      ? `${process.env.HOST}/static/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/${newName}.jpg`;
  }
}
const mediasService = new MediaService();
export default mediasService;

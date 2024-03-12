import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
export const initFolder = () => {
  const uploadFolderPath = path.resolve("uploads/images");
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true, // Tạo folder nested
    });
  }
};

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import("formidable")).default;
  const form = formidable({
    uploadDir: path.resolve("uploads"),
    maxFields: 1,
    keepExtensions: true,
    maxFieldsSize: 3000 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === "image" && Boolean(mimetype?.includes("image/"));
      if (!valid) {
        form.emit("error" as any, new Error("Invalid file type!") as any);
      }
      return valid;
    },
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error("File is empty"));
      }
      resolve(files)
    });
  });
};

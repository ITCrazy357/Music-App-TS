import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../helpers/uploadToCloudinary";

export const uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      req.body[req.file.fieldname] = result;
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

export const uploadFields = async (req: Request, res: Response, next: NextFunction) => {
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    try {
      if (files['avatar'] && files['avatar'][0]) {
        const resultAvatar = await uploadToCloudinary(files['avatar'][0].buffer, "image");
        req.body.avatar = resultAvatar;
      }
      if (files['audio'] && files['audio'][0]) {
        const resultAudio = await uploadToCloudinary(files['audio'][0].buffer, "video");
        req.body.audio = resultAudio;
      }
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

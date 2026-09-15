import formidable, { File } from "formidable";;

export const mimeTypeMap: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  ico: "image/x-icon",
};

export interface SingleUploadResult {
  fields: Record<string, any>;
  file: {
    originalFilename?: string;
    mimetype?: string;
    size?: number;
  };
  filename: string;
}


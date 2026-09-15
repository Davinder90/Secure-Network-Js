import path from "path";
import fsPromises from "fs/promises";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "./common.helper";
import { IResponseObject } from "@interfaces/common.interfaces";
import { ERROR_MESSAGES, IMAGE_STORAGE_PATH } from "@utils/constants";
import { mimeTypeMap } from "@type/file.types";
import { IBannerSnap } from "@interfaces/article/Image.Interface";

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

export interface IImageBufferResult {
  buffer: Buffer;
  base64Image: string;
  contentType: string;
  filename: string;
  size: number;
}

/* -------------------------------------------------------------------------- */
/*                         UNIQUE FILENAME GENERATOR                          */
/* -------------------------------------------------------------------------- */

/**
 * Generates a unique collision-resistant filename.
 */
export const generateFileUniqueName = (
  file: { name?: string; originalFilename?: string },
  username: string
): string => {
  const originalName = file.originalFilename || file.name || "image.png";
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${username}-${sanitizedName}`;
};

/* -------------------------------------------------------------------------- */
/*                         PATH SANITIZER & RESOLVER                          */
/* -------------------------------------------------------------------------- */

/**
 * Confines any raw input filename strictly to the server's default storage directory.
 * Defends against Path Traversal (../) and OS root injections.
 */
export const getSafeFilePath = (rawInput: string): string => {
  const baseFilename = path.basename(rawInput.trim());
  const safeUploadDirectory = path.resolve(IMAGE_STORAGE_PATH);
  const targetFilePath = path.resolve(safeUploadDirectory, baseFilename);

  if (!targetFilePath.startsWith(safeUploadDirectory)) {
    throw new Error("Access denied: Path traversal detected");
  }

  return targetFilePath;
};

/* -------------------------------------------------------------------------- */
/*                       BUFFER & BASE64 IMAGE GETTER                         */
/* -------------------------------------------------------------------------- */

/**
 * Reads an image file as a Buffer from the default storage path and generates
 * its corresponding Base64 data URL and MIME content type.
 */
export const getImageBuffer = async (
  rawFilename: string
): Promise<IImageBufferResult | null> => {
  try {
    const targetFilePath = getSafeFilePath(rawFilename);
    const baseFilename = path.basename(rawFilename.trim());

    // 1. Read directly into memory buffer
    const buffer = await fsPromises.readFile(targetFilePath);

    // 2. Resolve MIME type
    const ext = baseFilename.split(".").pop()?.toLowerCase();
    const contentType =
      ext && mimeTypeMap[ext] ? mimeTypeMap[ext] : "image/png";

    // 3. Construct Base64 data URL
    const base64Image = `data:${contentType};base64,${buffer.toString("base64")}`;

    return {
      buffer,
      base64Image,
      contentType,
      filename: baseFilename,
      size: buffer.length,
    };
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
};

/**
 * API service helper for the Get Image endpoint.
 * Returns either binary buffer metadata or an error response object.
 */
export const getImage = async (rawFilename: string) => {
  if (!rawFilename || typeof rawFilename !== "string") {
    return generateResponseObject({
      error: "Filename is required",
      status_code: StatusCodes.BAD_REQUEST,
    });
  }

  const result = (await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const data = await getImageBuffer(rawFilename);

      if (!data) {
        return {
          error: "Image not found on storage path",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Image loaded successfully",
        status_code: StatusCodes.OK,
        data,
      };
    },
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    StatusCodes.INTERNAL_SERVER_ERROR
  )) as IResponseObject;

  return generateResponseObject(result);
};

/* -------------------------------------------------------------------------- */
/*                        SAFE FILE DELETION HELPER                           */
/* -------------------------------------------------------------------------- */

/**
 * Safely unlinks a file from the server's default storage path using only its filename.
 */
export const deleteFile = async (rawFilename: string) => {
  if (!rawFilename || typeof rawFilename !== "string") {
    return generateResponseObject({
      error: "Invalid file identifier provided",
      status_code: StatusCodes.BAD_REQUEST,
    });
  }

  const result = (await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const baseFilename = path.basename(rawFilename.trim());
      const targetFilePath = getSafeFilePath(baseFilename);

      try {
        await fsPromises.unlink(targetFilePath);
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === "ENOENT") {
          return {
            error: "Image does not exist or has already been removed",
            status_code: StatusCodes.NOT_FOUND,
          };
        }
        throw err;
      }

      return {
        message: "Image removed successfully",
        status_code: StatusCodes.OK,
        data: { filename: baseFilename, deleted: true },
      };
    },
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    StatusCodes.INTERNAL_SERVER_ERROR
  )) as IResponseObject;

  return generateResponseObject(result);
};

/* -------------------------------------------------------------------------- */
/*                         INPUT FILE POST-PROCESSOR                          */
/* -------------------------------------------------------------------------- */

/**
 * Standardized response formatter for uploaded files. Attaches Base64 previews
 * generated from the buffer and clean public streaming URLs.
 */
export const inputFile = async (files: IBannerSnap[] | null) => {
  const result = (await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!files || files.length === 0) {
        return {
          error: "File is not uploaded",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const firstFile = files[0];
      const isXlsx = Boolean(
        firstFile?.filename && firstFile.filename.toLowerCase().endsWith(".xlsx")
      );

      let processedFiles: IBannerSnap[] = files;

      if (!isXlsx) {
        processedFiles = await Promise.all(
          files.map(async (file) => {
            const filename = file.filename || "";
            const imageMetadata = filename ? await getImageBuffer(filename) : null;

            return {
              filename,
              url: `/api/image/get?filename=${encodeURIComponent(filename)}`,
              base64Image: imageMetadata?.base64Image || file.base64Image || "",
            };
          })
        );
      }

      return {
        message: "File uploaded successfully",
        status_code: StatusCodes.OK,
        data: { files: processedFiles },
      };
    },
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    StatusCodes.INTERNAL_SERVER_ERROR
  )) as IResponseObject;

  return generateResponseObject(result);
};

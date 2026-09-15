import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { generateFileUniqueName } from "@helpers/file.helpers";
import { SingleUploadResult } from "@type/file.types";

export const parseSingleFile = async (
  req: NextRequest,
  storage_path: string,
  username: string
): Promise<SingleUploadResult> => {
  // 1. Guard against missing or wrong Content-Type headers
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw new Error(
      `Invalid request: Expected multipart/form-data but received "${contentType}". Check client request headers.`
    );
  }

  // 2. Ensure target storage directory exists
  await fs.mkdir(storage_path, { recursive: true });

  // 3. Parse Web FormData safely
  const formData = await req.formData();

  let uploadedFileBlob: globalThis.File | null = null;
  const fields: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof globalThis.File && !uploadedFileBlob) {
      uploadedFileBlob = value;
    } else if (typeof value === "string") {
      fields[key] = value;
    }
  }

  if (!uploadedFileBlob || uploadedFileBlob.size === 0) {
    throw new Error("No file uploaded");
  }

  // 4. Convert Web File to Buffer
  const bytes = await uploadedFileBlob.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 5. Generate unique name and write file directly to disk
  const uniqueName = generateFileUniqueName(uploadedFileBlob as any, username);
  const internalDestination = path.join(storage_path, uniqueName);

  await fs.writeFile(internalDestination, buffer);

  return {
    fields,
    file: {
      originalFilename: uploadedFileBlob.name,
      mimetype: uploadedFileBlob.type,
      size: uploadedFileBlob.size,
    },
    filename: uniqueName,
  };
};


// export const parseMultipleFiles = async (
//   req: NextRequest,
//   snapName: string,
//   storage_path: string,
//   username: string,
//   maxFiles: number = 40
// ): Promise<MultiUploadResult> => {
//   const form = formidable({
//     uploadDir: storage_path,
//     keepExtensions: true,
//     maxFiles,
//     multiples: true,
//   });
//   await fs.mkdir(storage_path, { recursive: true });
//   const incomingReq = nextRequestToIncomingMessage(req);
//   return await new Promise((resolve, reject) => {
//     form.parse(incomingReq, async (err, fields, files) => {
//       if (err) return reject(err);
//       const savedFiles: MultiUploadResult["files"] = {};
//       for (const [key, fileList] of Object.entries(files)) {
//         const fileArray = Array.isArray(fileList) ? fileList : [fileList];
//         savedFiles[key] = [];
//         for (const file of fileArray) {
//           const uniqueName = generateFileUniqueName(file as File, snapName, username);
//           const destination = path.join(storage_path, uniqueName);
//           await fs.rename((file as File)?.filepath, destination);
//           savedFiles[key].push({ filename: uniqueName, destination });
//         }
//       }
//       resolve({ fields, files: savedFiles });
//     });
//   });
// };

import { db } from "@/lib/db";
import sharp from "sharp";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const { configId } = metadata.input;

        // Use ufsUrl instead of deprecated url
        const imageUrl = file.ufsUrl;
        const res = await fetch(imageUrl);

        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        const imgMetaData = await sharp(buffer).metadata();
        const { width, height } = imgMetaData;

        if (!configId) {
          const configuration = await db.configuration.create({
            data: {
              imageUrl,
              height: height || 500,
              width: width || 500,
            },
          });

          return { configId: configuration.id };
        } else {
          const updatedConfiguration = await db.configuration.update({
            where: { id: configId },
            data: {
              croppedImageUrl: imageUrl,
            },
          });

          return { configId: updatedConfiguration.id };
        }
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw new UploadThingError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to process upload",
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

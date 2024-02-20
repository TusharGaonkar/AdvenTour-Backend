import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import formidable, { IncomingForm } from 'formidable';

const tourImagesUploadDir = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'tour-images-upload'
);

const filterFunction = (file: formidable.Part) => {
  const { name, originalFilename, mimetype } = file;
  const valid = name && originalFilename && mimetype.includes('image');
  return valid;
};

const formidableOptions: Partial<formidable.Options> = {
  uploadDir: tourImagesUploadDir,
  keepExtensions: true,
  allowEmptyFiles: false,
  multiples: true,
  filter: filterFunction,
};

const updateTourData = (
  oldTourData: Record<string, unknown>,
  updatedToursImagesPath: Record<string, string>
) => {
  const newTourData = { ...oldTourData };
  // console.log('oldTourData\n', oldTourData);
  // console.log('updatedToursImagesPath\n', updatedToursImagesPath);

  // update main cover image path;
  // please check the serialized keys by consoling it in uploadTourImagesAdventourServer()
  newTourData['mainCoverImage'] = updatedToursImagesPath['mainCoverImage[0]'];

  // update additional cover images
  const additionalCoverImages = oldTourData[
    'additionalCoverImages'
  ] as string[];

  additionalCoverImages?.forEach((item: string, index: number) => {
    const key = `additionalCoverImages[${index}]`;
    additionalCoverImages[index] = updatedToursImagesPath[key];
  });

  //  update itinerary images
  const itinerary = oldTourData['itinerary'] as Record<string, unknown>[];
  itinerary?.forEach((day: Record<string, unknown>, dayIndex: number) => {
    // get that day activity images
    const activities = day['activities'] as Record<string, unknown>[];

    activities?.forEach(
      (item: Record<string, unknown>, activityIndex: number) => {
        const key = `itinerary[${dayIndex}][activities][${activityIndex}][image][0]`;
        (newTourData['itinerary'] as any[])[dayIndex]['activities'][
          activityIndex
        ]['image'] = updatedToursImagesPath[key];
      }
    );
  });

  return newTourData;
};

//  A promise based custom image uploader for Adventour server
export const uploadTourImagesAdventourServer = (req: Request) => {
  return new Promise<Record<string, any>>(async (resolve, reject) => {
    try {
      if (!fs.existsSync(tourImagesUploadDir)) {
        fs.mkdirSync(tourImagesUploadDir, { recursive: true });
      }

      const form = new IncomingForm(formidableOptions);

      form.parse(req, async (err, fields, files) => {
        try {
          if (err) {
            throw new Error(
              err.message || 'Something went wrong while parsing files'
            );
          }

          const updatedTourImagesPath: Record<string, string> = {};

          const renamePromises: Promise<void>[] = [];

          for (const [key, value] of Object.entries(files)) {
            const { filepath, originalFilename } = value[0];
            const uniqueFileName = crypto.randomBytes(8).toString('hex');
            const fileExtension = path.extname(originalFilename);
            const newFileName = `${uniqueFileName}${fileExtension}`;
            const newPath = path.join(tourImagesUploadDir, newFileName);

            // Promisify fs.rename
            const renamePromise = fsPromises
              .rename(filepath, newPath)
              .then(() => {
                updatedTourImagesPath[key] = newPath;
              })
              .catch((renameError) => {
                reject(renameError);
              });

            renamePromises.push(renamePromise);
          }

          await Promise.all(renamePromises);

          if ('jsonTourData' in fields) {
            const tourData = JSON.parse(fields['jsonTourData'][0]);
            const updatedTourData = updateTourData(
              tourData,
              updatedTourImagesPath
            );
            resolve(updatedTourData);
          } else {
            throw new Error('Something went wrong while processing tour data');
          }
        } catch (error) {
          reject(
            error.message ??
              'Something went wrong while processing your tour files in server, please try again later'
          );
        }
      });
    } catch (error) {
      reject(
        error.message ??
          'Something went wrong while processing your tour files in server, please try again later'
      );
    }
  });
};

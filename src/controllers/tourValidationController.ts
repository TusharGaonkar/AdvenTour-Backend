import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import { uploadTourImagesAdventourServer } from '../utils/adventourTourImagesUpload';
import AdventourAppError from '../utils/adventourAppError';
import uploadTourImageToCloudinary from '../services/cloudinaryImageUpload';
import ToursValidation from '../models/toursValidationModel';
import processNewToursQueue from '../message-queues/queues/processNewToursQueue';
import { Job } from 'bullmq';

const saveTourImagesToCloudinary = async (tourData: Record<string, any>) => {
  try {
    // In case of failure we will retry in bullmq message queue right no need to modify the original tourData object
    // as itinerary is 2 level nested , {...tourData } will not work as well {...tourData , itinerary: {...tourData.itinerary} } as tourData.itinerary activities is nested
    // either use JSON.parse(JSON.stringify(tourData)) or _cloneDeep(tourData) from lodash

    const tourDataClone = JSON.parse(JSON.stringify(tourData));
    //  upload tour mainCoverImage

    if (tourDataClone.mainCoverImage)
      tourDataClone.mainCoverImage = await uploadTourImageToCloudinary(
        tourDataClone.mainCoverImage
      );
    else throw new AdventourAppError('Main cover image not found', 404);

    //  upload additional cover images
    if (
      tourDataClone.additionalCoverImages &&
      tourDataClone.additionalCoverImages.length === 2
    )
      tourDataClone.additionalCoverImages = await Promise.all(
        tourDataClone.additionalCoverImages.map((imagePath: string) => {
          return uploadTourImageToCloudinary(imagePath);
        })
      );
    else throw new AdventourAppError('Additional cover images not found', 404);

    //  upload itinerary images
    for (const day of tourDataClone.itinerary) {
      for (const activity of day.activities) {
        if (activity.image) {
          activity.image = await uploadTourImageToCloudinary(activity.image); // returns public_id and not the url
        } else {
          throw new AdventourAppError('Activity image not found', 404);
        }
      }
    }
    return tourDataClone;
  } catch (error) {
    throw new AdventourAppError(
      error.message ?? 'Something went wrong while uploading to cloud',
      500
    );
  }
};

export const processNewToursJob = apiClientErrorHandler(
  async (
    req: Request & { user: { userName: string; _id: string } },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      throw new AdventourAppError('User not found', 404);
    }
    const updatedTourData = await uploadTourImagesAdventourServer(req);

    // add job to queue , retry 3 times on failure
    await processNewToursQueue.add(
      'new-tour',
      {
        updatedTourData,
        user: req.user,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Enqueued new-tour job',
    });
  }
);

export const addTourToValidation = async (job: Job) => {
  try {
    const { updatedTourData, user } = job.data;
    const updatedTourDataWithCloudinary =
      await saveTourImagesToCloudinary(updatedTourData);

    const newValidationTour = await ToursValidation.create({
      ...updatedTourDataWithCloudinary,
      createdBy: user._id,
    });

    if (!newValidationTour)
      throw new AdventourAppError(
        'Something went wrong while adding tour to validation',
        500
      );
  } catch (error) {
    throw new AdventourAppError(error.message, 500);
  }
};

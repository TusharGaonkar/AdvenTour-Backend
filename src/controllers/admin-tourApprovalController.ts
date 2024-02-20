import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import { Request, Response, NextFunction } from 'express';
import ToursValidation from '../models/toursValidationModel';
import Tour from '../models/tourModel';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';

import { startSession } from 'mongoose';

//  Using transactional approach for atomicity and consistency of data in case of failure while updating multiple collections!
export const acceptTour = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        const {
          tourID,
          cancellationPolicy,
          tourCategory,
          adminName,
          additionalInformation,
        } = req.body;

        if (
          !tourID ||
          !cancellationPolicy ||
          !tourCategory ||
          !adminName ||
          !additionalInformation
        ) {
          throw new AdventourAppError('All fields are required', 400);
        }

        const validatedTour = await ToursValidation.updateOne(
          {
            _id: tourID,
          },
          {
            $set: {
              isAccepted: true,
              isVerified: true,
              $currentDate: {
                verificationDate: true,
              },
              cancellationPolicy,
              tourCategory,
              adminName,
              additionalInformation,
            },
          },
          {
            runValidators: true,
          }
        ).session(session);

        if (!validatedTour.modifiedCount)
          throw new AdventourAppError('Tour not found', 404);

        const updatedTour = await ToursValidation.findOne({
          _id: tourID,
        }).session(session);

        if (!updatedTour) throw new AdventourAppError('Tour not found', 404);

        const newTour = await Tour.create([updatedTour.toObject()], {
          session: session,
        });
        if (!newTour)
          throw new AdventourAppError('Error while publishing tour', 500);

        const updatedUserRole = await Users.updateOne(
          {
            _id: newTour[0].createdBy,
          },
          {
            $set: {
              role: 'local-guide',
            },
          },
          {
            runValidators: true,
          }
        ).session(session);

        if (!updatedUserRole.modifiedCount)
          throw new AdventourAppError('Error while publishing tour', 500);

        res.status(200).json({
          status: 'success',
          message: 'Tour accepted successfully and has been published',
        });
      });
    } catch (error) {
      throw new AdventourAppError(error.message, 500);
    } finally {
      session.endSession();
    }
  }
);

export const rejectTour = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tourID, adminName, tourRemarks } = req.body;
      if (!tourID || !adminName || !tourRemarks) {
        throw new AdventourAppError('All fields are required', 400);
      }

      const rejectedSubmission = await ToursValidation.updateOne(
        {
          _id: tourID,
        },
        {
          $set: {
            isRejected: true,
            isVerified: true,
            tourRemarks,
            adminName,
            $currentDate: {
              verificationDate: true,
            },
          },
        }
      );

      if (!rejectedSubmission.modifiedCount)
        throw new AdventourAppError('Tour not found', 404);

      res.status(200).json({
        status: 'success',
        message: 'Tour rejected successfully',
      });
    } catch (error) {
      throw new AdventourAppError(error.message, 500);
    }
  }
);

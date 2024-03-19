import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import Tour from './tourModel';
import validation from 'validator';
import AdventourAppError from '../utils/adventourAppError';

const tourReviewSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, 'Title must be at least 10 characters'],
    maxLength: [50, 'Title must be less than 50 characters'],
    validator: {
      validate: validation.isAlphanumeric,
      message: 'Title must be alphanumeric',
    },
  },

  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, 'Description must be at least 15 characters'],
    maxLength: [3000, 'Description must be less than 300 characters'],
  },

  travelGroup: {
    type: String,
    enum: {
      values: ['Family', 'Friends', 'Solo', 'Couples'],
      message:
        'Travel Group must be one of the following: Family, Friends, Solo, Couples, Business',
    },
    required: true,
    default: 'Solo',
  },

  reviewImages: {
    type: [String],
    required: false,
    validation: {
      validate: function (value: string[]) {
        return (
          value.length <= 2 &&
          value.every((item: string) => validation.isURL(item))
        );
      },
    },
  },
});

// ensure that the review can only be created once by a given user prevent duplicates by using compound indexes!
tourReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// once a review is posted , update the tour average ratings and total ratings
tourReviewSchema.post('save', async function (newReview, next) {
  try {
    const { tour } = newReview;

    // Calculate the total ratings and average ratings
    const tourRatingsStats = await TourReviews.aggregate([
      {
        $match: {
          tour: new mongoose.Types.ObjectId(tour),
        },
      },
      {
        $group: {
          _id: null, // group all the documents together
          totalRatings: { $sum: 1 },
          ratingsAverage: { $avg: '$rating' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRatings: 1,
          ratingsAverage: 1,
        },
      },
    ]);

    if (tourRatingsStats.length === 0) {
      throw new AdventourAppError(
        'No reviews found for this tour, can not update!',
        500
      );
    }

    const { totalRatings, ratingsAverage } = tourRatingsStats[0];

    const updatedTour = await Tour.findByIdAndUpdate(
      tour,
      {
        totalRatings,
        ratingsAverage,
      },
      { runValidators: true, new: true }
    );

    if (!updatedTour) {
      throw new AdventourAppError(
        'Something went wrong while updating tour average ratings!',
        500
      );
    }

    next();
  } catch (error) {
    throw new AdventourAppError(
      error.message ||
        'Something went wrong while updating tour average ratings!',
      500
    );
  }
});

const TourReviews = mongoose.model<InferSchemaType<typeof tourReviewSchema>>(
  'TourReviews',
  tourReviewSchema
);

export default TourReviews;

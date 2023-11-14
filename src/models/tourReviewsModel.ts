import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import Tours from '../models/bookmarkToursModel';
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
    default: Date.now(),
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
    maxLength: [500, 'Description must be less than 300 characters'],
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

  images: {
    type: [String],
    validation: {
      validate: function (value: string[]) {
        return (
          value.length <= 10 &&
          value.every((item: string) => validation.isURL(item))
        );
      },
    },
  },
});

// ensure that the review can only be created once by a given user prevent duplicates by using compound indexes!
tourReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const TourReviews = mongoose.model<InferSchemaType<typeof tourReviewSchema>>(
  'TourReviews',
  tourReviewSchema
);

// once a review is posted , update the tour average ratings and total ratings
tourReviewSchema.post('save', async function (newReview) {
  try {
    const { tour } = newReview;

    const tourRatingsStats = await TourReviews.aggregate([
      {
        $match: { tour },
      },
      {
        $group: {
          _id: '$tour', // or could be null doesn't matter here
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

    const { totalRatings, ratingsAverage } = tourRatingsStats[0];
    await Tours.findByIdAndUpdate(
      tour,
      {
        totalRatings,
        ratingsAverage,
      },
      { runValidators: true }
    );
  } catch (error) {
    throw new AdventourAppError(
      'Something went wrong while updating tour average ratings!',
      500
    );
  }
});

export default TourReviews;

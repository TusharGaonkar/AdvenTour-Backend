import mongoose, { InferSchemaType } from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minLength: [5, 'Title must be at least 5 characters'],
    maxLength: [30, 'Title must be at most 40 characters'],
    unique: true,
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    minLength: [15, 'Description must be at least 15 characters'],
    maxLength: [300, 'Description must be at most 400 characters'],
    trim: true,
  },

  mainCoverImage: {
    type: String,
    required: [true, 'Main cover image is required'],
    trim: true,
  },

  additionalImages: {
    type: [String],
    trim: true,
    validate: {
      validator: function (v: string[]) {
        return v.length <= 10;
      },
      message: 'You can have up to 10 additional images.',
    },
  },

  tourLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },

    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function (v: number[]) {
          return v.length === 2;
        },
        message: 'Coordinates must be an array with latitude and longitude',
      },
    },
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  lastUpdatedAt: {
    type: Date,
    default: Date.now(),
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Created by is required'],
  },

  tourDurationInDays: {
    type: Number,
    required: [true, 'Tour duration in days is required'],
    min: [1, 'Tour duration in days should be at least 1'],
  },

  tourStartDates: {
    type: [Date],
    required: [true, 'Tour start dates are required'],
  },

  repeatsEachMonth: {
    type: Boolean,
    default: false,
    required: [true, 'Repeats each month is required'],
  },

  tourStartTime: {
    type: String,
    required: [true, 'Tour start time is required'],
  },

  priceInRupees: {
    type: Number,
    required: [true, 'Price in Rupees is required'],
    validator: {
      validator: function (v: number) {
        return v > 0;
      },
      message: 'Price should be greater than 0',
    },
  },

  discountInRupees: {
    type: Number,
    required: [true, 'Discount in Rupees is required'],
    default: 0,
    validate: {
      validator: function (v: number) {
        return v < this.priceInRupees;
      },

      message: 'Discount should be less than price',
    },
  },

  ageGroups: {
    minAge: {
      type: Number,
      required: [true, 'Minimum age is required'],
      min: [1, 'Minimum age should be at least 1'],
    },
    maxAge: {
      type: Number,
      required: [true, 'Maximum age is required'],
      max: [100, 'Maximum age should not exceed 100'],
    },
  },

  tourMaxCapacity: {
    type: Number,
    required: [true, 'Tour max capacity is required'],
    min: [1, 'Tour max capacity should be at least 1'],
  },

  maxPeoplePerBooking: {
    type: Number,
    required: [true, 'Maximum people per booking is required'],
    validate: {
      validator: function (v: number) {
        return v > 1 && v <= this.tourMaxCapacity;
      },
      message:
        'Maximum people per booking should be greater than 0 and less than the tour capacity',
    },
  },

  tourDifficulty: {
    type: String,
    required: [true, 'Tour difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'],
  },

  liveGuideLanguages: {
    type: [String],
    required: [true, 'Live guide languages are required'],
    trim: true,
  },

  whatsIncluded: {
    type: [String],
    required: [true, `What's included is required`],
    trim: true,
  },

  whatsNotIncluded: {
    type: [String],
    required: [true, `What's not included is required`],
    trim: true,
  },

  additionalInformation: {
    type: [String],
    trim: true,
  },

  cancellationPolicy: {
    type: [String],
    required: [true, 'Cancellation policy is required'],
    trim: true,
  },

  FAQ: {
    type: [
      {
        question: {
          type: String,
          required: [true, 'FAQ question is required'],
          trim: true,
        },
        answer: {
          type: String,
          required: [true, 'FAQ answer is required'],
          trim: true,
        },
      },
    ],
  },

  itinerary: {
    type: [
      {
        day: {
          type: Number,
          required: [true, 'Itinerary day is required'],
          min: [1, 'Day should be at least 1'],
        },
        description: {
          type: String,
          required: [true, 'Itinerary description is required'],
          trim: true,
          minlength: [
            10,
            'Itinerary description should be at least 10 characters long',
          ],
          maxLength: [
            300,
            'Itinerary description should not exceed 300 characters',
          ],
        },
        image: {
          type: [String],
          trim: true,
        },
        locations: [
          {
            type: {
              type: String,
              default: 'Point',
              enum: ['Point'],
            },
            coordinates: {
              type: [[Number]],
              validate: {
                validator: function (coordinates: number[][]) {
                  return coordinates.every(
                    (coordinate: number[]) => coordinate.length === 2
                  );
                },
                message:
                  'Location should have two coordinates (latitude and longitude).',
              },
            },
          },
        ],
        foodIncluded: {
          type: String,
          required: [true, 'Food information is required'],
        },

        accommodationIncluded: {
          type: String,
          required: [true, 'Accommodation information is required'],
        },

        tourTags: {
          type: [String],
        },
      },
    ],
  },

  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings should be at least 0'],
  },

  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Ratings average should be at least 0'],
    max: [5, 'Ratings average should not exceed 5'],
  },
});

const Tour = mongoose.model<InferSchemaType<typeof tourSchema>>(
  'Tours',
  tourSchema
);

export default Tour;

import mongoose, { InferSchemaType } from 'mongoose';

const bookmarkTourSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Tours',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

// ensure that a tour can only be bookmarked once by a given user don't save duplicates using compound indexes!
bookmarkTourSchema.index({ tour: 1, user: 1 }, { unique: true });

const BookMarkedTours = mongoose.model<
  InferSchemaType<typeof bookmarkTourSchema>
>('BookMarkedTours', bookmarkTourSchema);

export default BookMarkedTours;

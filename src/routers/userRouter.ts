import express from 'express';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import {
  getUserBookmarks,
  deleteBookmark,
  createBookmark,
} from '../controllers/bookmarkToursController';
import getUserBookings from '../controllers/getUserBookings';
import updateProfile from '../controllers/updateProfile';
import updateUserAvatar from '../utils/adventourUserAvatarUpload';
import userBookingCancellation from '../controllers/userBookingCancellation';

const userRouter = express.Router();

userRouter
  .route('/bookmarks')
  .get(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    getUserBookmarks
  )
  .post(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    createBookmark
  )
  .delete(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    deleteBookmark
  );

userRouter.route('/bookings').get(requiresAuthentication, getUserBookings);
userRouter
  .route('/cancelBooking')
  .post(
    requiresAuthentication,
    requiresAuthorization(['user']),
    userBookingCancellation
  );

userRouter
  .route('/updateProfile')
  .patch(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    updateUserAvatar.single('avatar'),
    updateProfile
  );

export default userRouter;

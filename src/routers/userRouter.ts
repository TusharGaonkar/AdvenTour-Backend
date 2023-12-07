import express from 'express';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import {
  getUserBookmarks,
  deleteBookmark,
  createBookmark,
} from '../controllers/bookmarkToursController';

const userRouter = express.Router();

userRouter
  .route('/bookmarks')
  .get(
    requiresAuthentication,
    requiresAuthorization(['user']),
    getUserBookmarks
  )
  .post(requiresAuthentication, requiresAuthorization(['user']), createBookmark)
  .delete(
    requiresAuthentication,
    requiresAuthorization(['user']),
    deleteBookmark
  );

export default userRouter;

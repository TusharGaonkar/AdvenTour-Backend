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

export default userRouter;

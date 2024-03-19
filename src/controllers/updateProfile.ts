import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import Users from '../models/userModel';
import uploadImageToCloudinary from '../services/cloudinaryImageUpload';

const updateProfile = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    const user = req.user;
    if (!user) throw new AdventourAppError('User not found', 401);

    const file = req.file;
    if (!file)
      throw new AdventourAppError('Please upload a profile picture', 400);

    const updatedCloudinaryURL = await uploadImageToCloudinary(
      file.path,
      'adventour-users'
    );

    if (!updatedCloudinaryURL) {
      throw new AdventourAppError('Failed to upload profile picture', 400);
    }

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      {
        avatar: updatedCloudinaryURL,
      },
      { new: true }
    );

    if (!updatedUser) throw new AdventourAppError('User not found', 404);

    return res.status(200).json({
      status: 'success',
      message: 'Profile picture updated successfully',
    });
  }
);

export default updateProfile;

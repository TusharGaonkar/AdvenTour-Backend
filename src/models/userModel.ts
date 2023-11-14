import mongoose, { HydratedDocument, InferSchemaType, Query } from 'mongoose';
import validation from 'validator';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import AdventourAppError from '../utils/adventourAppError';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    validator: {
      validate: validation.isAlpha,
      message: 'Name can only contain letters',
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validator: {
      validate: validation.isEmail,
      message: 'Email is not valid',
    },
    trim: true,
  },

  authProvider: {
    type: String,
    enum: {
      values: ['adventour', 'google'],
      message: 'AuthProvider must be one of the following: adventour, google',
    },
    required: true,
    default: 'adventour',
  },
  password: {
    type: String,
    trim: true,
    minLength: [6, 'Password must be at least 6 characters'],
    maxLength: [60, 'Password must be at most 40 characters'], //bcrypt module produces 60 characters hash!
    select: false,
    required: function () {
      return this.authProvider === 'adventour';
    }, // required only if the registered using jwt ok!
  },

  avatar: {
    type: String,
    validator: {
      validate: validation.isURL,
      message: 'Avatar url is not valid',
    },
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },

  role: {
    type: String,
    enum: {
      values: ['user', 'local-guide', 'admin'],
      message: 'Role must be one of the following: user, local-guide, admin',
    },
    required: true,
    default: 'user',
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  passwordLastUpdatedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

export const hashDBPassword = async (password: string) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassWord = await bcrypt.hash(password, salt);

  return hashedPassWord;
};

userSchema.methods.generateJwtToken = function () {
  const { userName, email } = this;
  const token = jsonwebtoken.sign({ userName, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });

  return token;
};

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!candidatePassword) return false;
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Pre save middleware on save
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await hashDBPassword(this.password.trim());
      this.passwordLastUpdatedAt = new Date(Date.now());
    }
    await this.validate(); // schema validators don't run on pre-save if u skip
    next();
  } catch (error) {
    next(
      new AdventourAppError(
        error.message ?? 'Error while hashing password',
        500
      )
    );
  }
});

const Users = mongoose.model<InferSchemaType<typeof userSchema>>(
  'Users',
  userSchema
);

export default Users;

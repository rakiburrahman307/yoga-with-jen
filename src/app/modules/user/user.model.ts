import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { IUser, UserModel } from './user.interface';

// Define the user schema
const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    image: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    
    joinDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionTitle: {
      type: String,
      default: '',
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    packageName: {
      type: String,
      default: 'N/A',
    },
    trialExpireAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      },
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
    isFreeTrial: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: false,
    },
  },
  { timestamps: true },
);
// Exist User Check
userSchema.statics.isExistUserById = async (id: string) => {
  return await User.findById(id);
};
// Static function to check if a user exists by email
userSchema.statics.isExistUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Static function to check if a user exists by phone
userSchema.statics.isExistUserByPhone = async (phone: string) => {
  return await User.findOne({ phone });
};
// Password Matching
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

// Static function to check if a user is in free trial
userSchema.statics.isInFreeTrial = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  return user.isFreeTrial && user.trialExpireAt > new Date();
};

// Static function to check if the user's subscription is active
// userSchema.statics.hasActiveSubscription = async (userId: string) => {
//   const user = await User.findById(userId).populate('subscription');
//   if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

//   // Assuming the Subscription model has an `isActive` and `expiryDate` field
//   const subscription = user.subscription;
//   if (subscription && subscription.isActive && subscription.expiryDate > new Date()) {
//     return true;
//   }
//   return false;
// };

// Static function to check if the user's free trial has expired
userSchema.statics.hasTrialExpired = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  return user.trialExpireAt < new Date();
};

// Pre-save hook to hash the user's password and check email uniqueness
userSchema.pre('save', async function (next) {
  const isExist = await User.findOne({ email: this.get('email') });
  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already exists!');
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// Query Middleware to exclude deleted users
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Export the user model
export const User = model<IUser, UserModel>('User', userSchema);

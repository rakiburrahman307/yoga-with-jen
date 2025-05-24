import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import config from '../../../config';
import bcrypt from 'bcrypt';
import { USER_ROLES } from '../../../enums/user';
const createAdminToDB = async (payload: IUser): Promise<IUser> => {
     const createAdmin: any = await User.create(payload);
     if (!createAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
     }
     const dcryptPass = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));
     if (createAdmin) {
          await User.findByIdAndUpdate({ _id: createAdmin?._id }, { verified: true, password: dcryptPass, role: USER_ROLES.ADMIN }, { new: true });
     }
     return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
     const isExistAdmin = await User.findByIdAndDelete(id);
     if (!isExistAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
     }
     return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
     const admins = await User.find({ role: 'ADMIN' }).select('name email phone role createdAt');
     return admins;
};

export const AdminService = {
     createAdminToDB,
     deleteAdminFromDB,
     getAdminFromDB,
};

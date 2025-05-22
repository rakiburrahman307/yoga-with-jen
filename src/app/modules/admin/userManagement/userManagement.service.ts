import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { User } from '../../user/user.model';
// get all the users
const getUsersFromDb = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(User.find({ role: 'USER' }), query);
     const users = await queryBuilder.fields().filter().paginate().search(['name', 'email', 'phone']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          users,
          meta,
     };
};
// get single users
const getSingleUser = async (id: string) => {
     const result = await User.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }
     return result;
};
// update user status
const updateUsersFromDb = async (id: string, payload: string) => {
     const user = await User.findById(id);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }
     const updateStatus = await User.findByIdAndUpdate(
          id,
          {
               $set: { status: payload },
          },
          { new: true },
     );
     if (!updateStatus) {
          throw new AppError(StatusCodes.FORBIDDEN, 'Faild to update status');
     }
};
export const userManagementService = {
     getUsersFromDb,
     getSingleUser,
     updateUsersFromDb,
};

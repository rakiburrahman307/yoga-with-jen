import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Quotation } from './quotationManagement.model';
import { IQuotation } from './quotationManagement.interface';

const cretaeQuotation = async (payload: IQuotation) => {
  const newQuotation = await Quotation.create(payload);
  if (!newQuotation) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Faield to create!');
  }
  return newQuotation;
};
// get all the users
const getQuotationFromDb = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Quotation.find({}), query);
  const users = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .search(['name email phone'])
    .sort()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    users,
    meta,
  };
};

// get single users
const getSingleQuotation = async (id: string) => {
  const result = await Quotation.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not found!');
  }
  return result;
};

// update quotation status
const updateQuotationStatusFromDb = async (id: string, payload: string) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not found!');
  }
  const updateStatus = await Quotation.findByIdAndUpdate(
    id,
    {
      $set: { status: payload },
    },
    { new: true },
  );
  if (!updateStatus) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Faild to update quotation');
  }
  return updateStatus;
};
// update quotation status
const updateQuotationFromDb = async (
  id: string,
  payload: Partial<IQuotation>,
) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not found!');
  }
  const updateQuotation = await Quotation.findByIdAndUpdate(
    id,
    {
      ...payload,
    },
    { new: true },
  );
  if (!updateQuotation) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Faild to update quotation');
  }
  return updateQuotation;
};

// delete user status
const deleteQuotationFromDb = async (id: string) => {
  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not found!');
  }
  const deleteQuotation = await Quotation.findByIdAndDelete(id);
  if (!deleteQuotation) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Faild to delete quotation');
  }
  return deleteQuotation;
};

export const quotationManagementService = {
  cretaeQuotation,
  getQuotationFromDb,
  getSingleQuotation,
  updateQuotationFromDb,
  deleteQuotationFromDb,
  updateQuotationStatusFromDb,
};

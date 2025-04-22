import { StatusCodes } from 'http-status-codes';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import mongoose from 'mongoose';
import { createSubscriptionProduct } from '../../../helpers/createSubscriptionProductHelper';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createPackageToDB = async (
  payload: IPackage,
): Promise<IPackage | null> => {
  const productPayload = {
    title: payload.title,
    description: payload.description,
    duration: payload.duration,
    price: Number(payload.price),
  };

  const product = await createSubscriptionProduct(productPayload);

  if (!product) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Failed to create subscription product',
    );
  }

  if (product) {
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;
  }

  const result = await Package.create(payload);
  if (!result) {
    await stripe.products.del(product.productId);
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Package');
  }

  return result;
};

const updatePackageToDB = async (
  id: string,
  payload: IPackage,
): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const result = await Package.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to Update Package');
  }

  return result;
};

const getPackageFromDB = async (queryParms: Record<string, unknown>) => {
  const query: any = {
    status: 'active',
    isDeleted: false,
  };

  const queryBuilder = new QueryBuilder(Package.find( query ), queryParms);
  const packages = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .sort()
    .modelQuery.exec();
  console.log(packages);
  const meta = await queryBuilder.countTotal();
  return {
    packages,
    meta,
  };
};

const getPackageDetailsFromDB = async (
  id: string,
): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }
  const result = await Package.findById(id);
  return result;
};

const deletePackageToDB = async (id: string): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
  }

  const result = await Package.findByIdAndUpdate(
    { _id: id },
    { status: 'inactive', isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to deleted Package');
  }

  return result;
};

export const PackageService = {
  createPackageToDB,
  updatePackageToDB,
  getPackageFromDB,
  getPackageDetailsFromDB,
  deletePackageToDB,
};

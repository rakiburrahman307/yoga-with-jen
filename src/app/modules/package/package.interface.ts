import { Model } from 'mongoose';

export type IPackage = {
  title: String;
  description: String;
  price: Number;
  priceId: String;
  duration: '1 month' | '3 months' | '6 months' | '1 year';
  paymentType: 'Monthly' | 'Yearly';
  productId?: String;
  subscriptionType: 'app' | 'web';
  status: 'active' | 'inactive';
  isDeleted: Boolean;
};

export type PackageModel = Model<IPackage, Record<string, unknown>>;

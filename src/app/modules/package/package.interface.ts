import { Model } from "mongoose";

export type IPackage = {
    title: String;
    description: String;
    price: Number;
    duration: '1 month' | '3 months' | '6 months' | '1 year'; 
    paymentType: 'Monthly' | 'Yearly';
    productId?: String;
    subscriptionType: 'app' | 'web';
    paymentLink?: string;
    status: 'Active' | 'Delete'
}

export type PackageModel = Model<IPackage, Record<string, unknown>>;
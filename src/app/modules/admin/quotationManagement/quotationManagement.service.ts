import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Quotation } from './quotationManagement.model';
import { IQuotation } from './quotationManagement.interface';

// const createQuotation = async (payload: IQuotation) => {
//      const newQuotation = await Quotation.create(payload);
//      if (!newQuotation) {
//           throw new AppError(StatusCodes.FORBIDDEN, 'Faield to create!');
//      }
//      return newQuotation;
// };

const createQuotation = async (payload: IQuotation) => {
     console.log('Input releaseAt:', payload.releaseAt);
     // Find the last quotation sorted by releaseAt descending
     const lastQuotation = await Quotation.findOne().sort({ releaseAt: -1 });
     let releaseAtDate: Date;
     if (!lastQuotation) {
          // No previous quotation exists
          if (payload.releaseAt) {
               releaseAtDate = new Date(payload.releaseAt);
          } else {
               releaseAtDate = new Date(); // Current date if no releaseAt provided
          }
     } else {
          // Previous quotation exists
          if (payload.releaseAt) {
               const inputDate = new Date(payload.releaseAt);
               const lastDate = lastQuotation.releaseAt ? new Date(lastQuotation.releaseAt) : new Date();
               // If input date is later than last releaseAt, use input date
               if (inputDate > lastDate) {
                    releaseAtDate = inputDate;
               } else {
                    // Input date is earlier or same, add 1 day to last releaseAt
                    releaseAtDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
               }
          } else {
               // No releaseAt provided, add 1 day to last releaseAt
               const lastDate = lastQuotation.releaseAt ? new Date(lastQuotation.releaseAt) : new Date();
               releaseAtDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
          }
     }

     const newQuotation = new Quotation({
          quotation: payload.quotation, // Fixed: এখানে payload.quotation হবে
          releaseAt: releaseAtDate,
     });

     const savedQuotation = await newQuotation.save();
     return savedQuotation;
};
// get all the users

const getQuotationFromDb = async () => {
     const today = new Date();
     today.setHours(0, 0, 0, 0); // Set to start of day
     
     const tomorrow = new Date(today);
     tomorrow.setDate(today.getDate() + 1); // Next day start
     
     // Find quotation for today
     let todayQuotation = await Quotation.findOne({
         releaseAt: {
             $gte: today,
             $lt: tomorrow
         }
     });
     
     // If no quotation found for today, get the most recent one
     if (!todayQuotation) {
         // Get the most recent quotation (newest by releaseAt)
         todayQuotation = await Quotation.findOne().sort({ releaseAt: -1 });
         
         if (!todayQuotation) {
             return {
                 quotation: null,
                 message: 'No quotations available'
             };
         }
         
         // Optional: Add a flag to indicate this is a fallback
         return {
             quotation: todayQuotation,
             message: 'No quotation for today, showing most recent quotation',
             isFallback: true
         };
     }
     
     return {
         quotation: todayQuotation,
         message: 'Quotation retrieved successfully',
         isFallback: false
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
const updateQuotationFromDb = async (id: string, payload: Partial<IQuotation>) => {
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
     createQuotation,
     getQuotationFromDb,
     getSingleQuotation,
     updateQuotationFromDb,
     deleteQuotationFromDb,
     updateQuotationStatusFromDb,
};

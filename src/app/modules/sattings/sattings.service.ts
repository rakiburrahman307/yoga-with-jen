import path from 'path';
import { ISettings } from './sattings.interface';
import Settings from './sattings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

const upsertSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
     const existingSettings = await Settings.findOne({});
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({}, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          const newSettings = await Settings.create(data);
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};
const getSettings = async (title: string) => {
     const settings: any = await Settings.findOne().select(title);
     if (title && settings[title]) {
          return settings[title];
     }
     return settings;
};

const getTermsOfService = async () => {
     const settings: any = await Settings.findOne();
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.termsOfService;
};
const getSupport = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.support;
};
const getPrivacyPolicy = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.privacyPolicy;
};
const getAboutUs = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.aboutUs;
};

// const getPrivacyPolicy = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'privacyPolicy.html');
// };

const getAccountDelete = async () => {
     return path.join(__dirname, '..', 'htmlResponse', 'accountDelete.html');
};

// const getSupport = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'support.html');
// };
export const settingsService = {
     upsertSettings,
     getSettings,
     getPrivacyPolicy,
     getAccountDelete,
     getSupport,
     getTermsOfService,
     getAboutUs,
};

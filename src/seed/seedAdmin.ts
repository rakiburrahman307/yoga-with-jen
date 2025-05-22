import mongoose from 'mongoose';
import { User } from '../app/modules/user/user.model';
import { Category } from '../app/modules/category/category.model'; // adjust the import path if needed
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import bcrypt from 'bcrypt';

// Category data for seeding
const categoriesData = [
     {
          name: 'Video',
          categoryType: 'media',
          status: 'active',
     },
     {
          name: 'Photo',
          categoryType: 'media',
          status: 'active',
     },
     {
          name: 'Upcoming',
          categoryType: 'event',
          status: 'active',
     },
     {
          name: 'Inspiration',
          categoryType: 'content',
          status: 'active',
     },
];

// User data for seeding
const usersData = [
     {
          name: 'Administrator',
          email: config.super_admin.email,
          role: USER_ROLES.SUPER_ADMIN,
          password: config.super_admin.password, // No need to hash here
          verified: true,
     },
];

// Function to hash password
const hashPassword = async (password: string) => {
     const salt = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
     return await bcrypt.hash(password, salt);
};

// Function to seed users
const seedUsers = async () => {
     try {
          await User.deleteMany();
          const hashedUsersData = await Promise.all(
               usersData.map(async (user: any) => {
                    const hashedPassword = await hashPassword(user.password);
                    return { ...user, password: hashedPassword };
               }),
          );
          await User.insertMany(hashedUsersData);
          console.log('Users seeded successfully!');
     } catch (err) {
          console.error('Error seeding users:', err);
     }
};

// Function to seed categories
const seedCategories = async () => {
     try {
          await Category.deleteMany();
          await Category.insertMany(categoriesData);
          console.log('Categories seeded successfully!');
     } catch (err) {
          console.error('Error seeding categories:', err);
     }
};

// Main seeding function
const seedSuperAdmin = async () => {
     try {
          console.log('--------------> Database seeding start <--------------');
          await seedUsers();
          await seedCategories(); // Seed categories after users
          console.log('--------------> Database seeding completed <--------------');
     } catch (error) {
          logger.error('Error creating Super Admin:', error);
     } finally {
          mongoose.disconnect();
     }
};

// Connect to MongoDB and run the seeding
mongoose
     .connect(config.database_url as string)
     .then(() => seedSuperAdmin())
     .catch((err) => console.error('Error connecting to MongoDB:', err));

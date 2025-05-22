import { Subscription } from '../../subscription/subscription.model';
import { User } from '../../user/user.model';
import { Video } from '../videosManagement/videoManagement.model';

const getRevenue = async () => {
     const result = await Subscription.aggregate([
          // Project year, month, and price
          {
               $project: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    price: 1, // Include the price field
               },
          },
          // Group by year and month, summing the prices
          {
               $group: {
                    _id: { year: '$year', month: '$month' },
                    total: { $sum: '$price' }, // Summing the prices
               },
          },
          // Sort by year and month in ascending order
          {
               $sort: { '_id.year': 1, '_id.month': 1 },
          },
     ]);

     // Define month names to match the required structure
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

     // Initialize the response with zero revenue for all months
     const monthlyRevenue = months.map((month) => ({
          month,
          totalRevenue: 0,
     }));

     // Map the aggregation result to the corresponding month and update the totalRevenue
     result.forEach((item) => {
          const monthIndex = item._id.month - 1; // Adjust for zero-indexed array
          const monthName = months[monthIndex];
          const monthData = monthlyRevenue.find((m) => m.month === monthName);
          if (monthData) {
               monthData.totalRevenue = item.total;
          }
     });

     // Return the result in the desired format
     return {
          success: true,
          message: 'Total revenue analysis retrieved successfully',
          data: monthlyRevenue,
     };
};
const getStatistics = async () => {
     const totalVideos = await Video.countDocuments();
     const totalEarn = await Subscription.aggregate([
          {
               $group: {
                    _id: null,
                    total: { $sum: '$price' }, // Summing the prices
               },
          },
     ]);
     const totalUsers = await User.countDocuments({ role: 'USER' });
     const totalSubscriptionsSell = await Subscription.countDocuments();
     return {
          totalVideos,
          totalEarn: totalEarn[0]?.total || 0,
          totalUsers,
          totalSubscriptionsSell,
     };
};
const getResentUsers = async () => {
     const result = await User.find({ role: 'USER' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt phone isSubscribed packageName status');
     return result;
};
export const DashboardService = { getRevenue, getStatistics, getResentUsers };

import catchAsync from '../../../../shared/catchAsync';
import { DashboardService } from './dashboard.service';

const getRevenue = catchAsync(async (req, res) => {
     const result = await DashboardService.getRevenue();
     res.status(200).json({
          success: true,
          message: 'Revenue retrieved successfully',
          data: result,
     });
});
const getStatistics = catchAsync(async (req, res) => {
     const result = await DashboardService.getStatistics();
     res.status(200).json({
          success: true,
          message: 'Statistics retrieved successfully',
          data: result,
     });
});
const getResentUsers = catchAsync(async (req, res) => {
     const result = await DashboardService.getResentUsers();
     res.status(200).json({
          success: true,
          message: 'Statistics retrieved successfully',
          data: result,
     });
});
export const DashboardController = {
     getRevenue,
     getStatistics,
     getResentUsers,
};

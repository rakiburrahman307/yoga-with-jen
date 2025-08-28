import QueryBuilder from '../../builder/QueryBuilder';
import { Videos } from '../admin/videos/video.model';
import { Category } from '../category/category.model';

const getAllLetestVideos = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Videos.find(), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['name']).modelQuery;

     const meta = await queryBuilder.countTotal();

     return {
          result,
          meta,
     };
};
const getAllCategories = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Category.find(), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['name']).modelQuery;

     const meta = await queryBuilder.countTotal();

     return {
          result,
          meta,
     };
};

export const ExploreService = {
     getAllCategories,
     getAllLetestVideos,
};

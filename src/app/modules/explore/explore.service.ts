import QueryBuilder from '../../builder/QueryBuilder';
import { Category } from '../category/category.model';

const getAllCategories = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Category.find(), query);

  const result = await queryBuilder
    .fields()
    .sort()
    .paginate()
    .filter()
    .search(['name']).modelQuery;

  const meta = await queryBuilder.countTotal();

  return {
    result,
    meta,
  };
};

export const ExploreService = {
  getAllCategories,
};

import { FilterQuery, Query } from 'mongoose';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }
  // filter() {
  //   const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  //   const queryObj = { ...this.query };
  //   excludeFields.forEach((el) => delete queryObj[el]);

  //   this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
  //   return this;
  // }
  filter() {
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    const queryObj = { ...this.query };
  
    // Remove excluded fields
    excludeFields.forEach((el) => delete queryObj[el]);
  
    // Modify queryObj to add case-insensitive regex for string fields
    const modifiedQueryObj = Object.entries(queryObj).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        // Apply a case-insensitive regex for string fields
        acc = { ...acc, [key]: { $regex: new RegExp(value, 'i') } };
      } else {
        // Leave other types (e.g., numbers, booleans) as they are
        acc = { ...acc, [key]: value };
      }
      return acc;
    }, {} as FilterQuery<T>);
  
    // Apply the modified query to the Mongoose find
    this.modelQuery = this.modelQuery.find(modifiedQueryObj);
  
    return this;
  }

  sort() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate(defaultLimit = 10) {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit).sort();
    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    try {
      const totalQueries = this.modelQuery.getFilter();
      const total = await this.modelQuery.model.countDocuments(totalQueries);
      const page = Number(this.query?.page) || 1;
      const limit = Number(this.query?.limit) || 10;
      const totalPage = Math.ceil(total / limit);

      return { page, limit, total, totalPage };
    } catch (error) {
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error as string);
    }
  }
}

export default QueryBuilder;

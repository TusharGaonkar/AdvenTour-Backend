import { Request } from 'express';
import { Model, PipelineStage } from 'mongoose';
import { cloneDeep } from 'lodash';

interface ModifiedRequest extends Request {
  query: Record<string, any>;
}

export default class AdvenTourQueryBuilder {
  protected reqQueryObj: ModifiedRequest;
  protected modifiedReqQueryObj: ModifiedRequest;
  protected pipeline: PipelineStage[] = [];
  protected model: Model<Record<string, any>>;

  constructor(reqQuery: Request, model: Model<Record<string, any>>) {
    this.reqQueryObj = cloneDeep(reqQuery) as ModifiedRequest;
    this.modifiedReqQueryObj = cloneDeep(reqQuery) as ModifiedRequest;
    this.model = model;
  }

  public filterData() {
    const filters = ['sort', 'limit', 'page', 'fields', 'search'];
    filters.forEach((filter) => delete this.modifiedReqQueryObj.query[filter]);

    const reqQueryString = JSON.stringify(
      this.modifiedReqQueryObj.query
    ).replace(
      /\b(lt|lte|gt|gte|in)\b/g,
      (matchedString) => `$${matchedString}`
    );

    this.modifiedReqQueryObj.query = JSON.parse(
      reqQueryString,
      function (key, value) {
        if (key === '$in') {
          console.log(value);

          if (value.length > 0) {
            const parsedArray = value.split(',');
            return parsedArray.map((item: string) => {
              const numOfDays = parseInt(item, 10);
              if (!isNaN(numOfDays)) {
                return numOfDays;
              }
              return item;
            });
          }
          return value;
        }
        if (
          key === '$lt' ||
          key === '$lte' ||
          key === '$gt' ||
          key === '$gte'
        ) {
          return parseInt(value, 10);
        }
        console.log('filterstage', this.pipeline);
        return value;
      }
    );
    console.log(this.modifiedReqQueryObj.query);
    this.pipeline.push({
      $match: this.modifiedReqQueryObj.query,
    });

    return this;
  }

  public sortData() {
    if (this.reqQueryObj.query.sort) {
      const { sort } = this.reqQueryObj.query;
      const convertedSort: Record<string, any> = {};

      for (const key in sort) {
        const value = parseInt(sort[key], 10);
        if (!isNaN(value) && (value === -1 || value === 1)) {
          convertedSort[key] = value;
        }
      }

      this.pipeline.push({
        $sort: convertedSort,
      });
    }

    return this;
  }

  public projectFields() {
    if (
      typeof this.reqQueryObj.query.fields === 'string' &&
      this.reqQueryObj.query.fields.length > 0
    ) {
      const fields = JSON.parse(this.reqQueryObj.query.fields).split(',');
      const projectOptions: Record<string, number> = {};
      for (const field of fields) {
        projectOptions[field] = 1;
      }

      this.pipeline.push({
        $project: projectOptions,
      });
    }

    return this;
  }

  public searchData() {
    if (this.reqQueryObj.query.search) {
      const { search } = this.reqQueryObj.query;

      this.pipeline.push({
        $search: {
          index: 'searchTours',
          text: {
            query: search,
            path: {
              wildcard: '*',
            },
          },
        },
      });

      console.log('searchstage', this.pipeline);
    }
    return this;
  }
  public paginate() {
    const defaultPage = 1;
    const defaultLimit = 6;
    const requestedPage =
      parseInt(this.reqQueryObj.query.page as string, 10) || defaultPage;
    const requestedLimit =
      parseInt(this.reqQueryObj.query.limit as string, 10) || defaultLimit;
    const startIndex = (requestedPage - 1) * requestedLimit;

    this.pipeline.push({
      $skip: startIndex,
    });

    this.pipeline.push({
      $limit: requestedLimit,
    });

    return this;
  }

  public getQuery() {
    return this.model.aggregate(this.pipeline);
  }
}

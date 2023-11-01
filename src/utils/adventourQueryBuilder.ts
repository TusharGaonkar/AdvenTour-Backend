import { Request } from 'express';
import { Model, Query } from 'mongoose';
import { cloneDeep } from 'lodash';

/*
@param {Object} reqQuery -> Request Object
@param {Object} model -> Mongoose Model
returns Mongoose Query Object
*/

//Custom query builder for our api..

export default class AdvenTourQueryBuilder {
  protected reqQueryObj: Request;
  protected modifiedReqQueryObj: Request;
  protected sanitizedQuery: Query<Record<string, any>, any>;
  protected model: Model<Record<string, any>>;

  constructor(reqQuery: Request, model: Model<Record<string, any>>) {
    this.reqQueryObj = cloneDeep(reqQuery);
    this.modifiedReqQueryObj = cloneDeep(reqQuery);
    this.model = model;
  }

  // first remove sort , limit , page and fields from the url
  public filterData() {
    const filters = ['sort', 'limit', 'page', 'fields'];
    filters.forEach((filter) => delete this.modifiedReqQueryObj.query[filter]);

    // Advanced filtering example of the call api/v-1.0/tours?duration[gt]=2&priceInRupee[lte]=6000
    const reqQueryString = JSON.stringify(
      this.modifiedReqQueryObj.query
    ).replace(/\b(lt|lte|gt|gte)/g, (matchedString) => `$${matchedString}`);
    // replace {duration : {gte :600}} to {duration : {$gte : 600} \b only matches starting with 'lt' or 'lte' etc

    this.modifiedReqQueryObj.query = JSON.parse(reqQueryString);
    this.sanitizedQuery = this.model.find(this.modifiedReqQueryObj.query);
    return this;
  }

  public sortData(defaultSortingCriteria: string | undefined = undefined) {
    if (this.reqQueryObj.query.sort) {
      const sortCriteria = (this.reqQueryObj.query.sort as string)
        .split(',')
        .join(' ');
      this.sanitizedQuery = this.sanitizedQuery.sort(sortCriteria);
    }
    //  {sort : "difficulty,priceInRupee"} => model.sort("difficulty priceInRupee")
    if (defaultSortingCriteria)
      this.sanitizedQuery = this.sanitizedQuery.sort(defaultSortingCriteria);
    return this;
  }

  public projectFields(defaultProjectFields: string | undefined = undefined) {
    if (this.reqQueryObj.query.fields) {
      const projectFields = (this.reqQueryObj.query.fields as string)
        .split(',')
        .join(' ');
      this.sanitizedQuery = this.sanitizedQuery.select(projectFields);
    }
    if (defaultProjectFields)
      this.sanitizedQuery = this.sanitizedQuery.select(defaultProjectFields);
    return this;
  }

  public async paginate() {
    const defaultPage = 1;
    const defaultLimit = 5;
    const requestedPage =
      parseInt(this.reqQueryObj.query.page as string, 10) || defaultPage;
    const docsLimit =
      parseInt(this.reqQueryObj.query.limit as string, 10) || defaultLimit;
    const docsSkipped = (requestedPage - 1) * docsLimit;

    const currentTotalTours = await this.model.countDocuments();
    if (docsSkipped >= currentTotalTours) throw new Error("Page doesn't exist");
    this.sanitizedQuery = this.sanitizedQuery
      .skip(docsSkipped)
      .limit(docsLimit);

    return this;
  }

  public getQuery() {
    return this.sanitizedQuery;
  }
}

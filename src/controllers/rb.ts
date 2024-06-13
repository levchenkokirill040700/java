import { Request } from 'express';
import Actions from '../utils/db_actions';
import Ratings from './ratings';
import RbModel from '../models/rb';
import Utils from './lib/rb_utils';
import * as I from '../interfaces';

class Rootbeer {
    utils: Utils;
    ratings: Ratings;
    rb_actions: Actions;

    constructor() {
        this.rb_actions = new Actions(RbModel);
        this.utils = new Utils();
        this.ratings = new Ratings();
    }

    private _addImagePath(req: Request, rbInfo: Partial<I.RootBeer>) {
        if (req.file && req.file.filename) {
            rbInfo.image = `rb_imgs/${req.file.filename}`;
        }
    }

    async create(req: Request) {
        const { user }: any = req;

        const rbInfo: Partial<I.RootBeer> = {
            name: this.utils.sanitizeStrings(req.body.rb_brand_name),
            created: new Date(),
            user: user._id
        };

        if (req.body.write_up) {
            rbInfo.write_up = this.utils.sanitizeStrings(req.body.write_up);
        }

        this._addImagePath(req, rbInfo);
    
        return this.rb_actions.create(rbInfo);
    }

    async update(req: Request): Promise<I.Result> {
        const updateFields: { name?: string, image?: string, write_up?: string } = {};

        this._addImagePath(req, updateFields);

        if(req.body) {
            if (req.body.rb_brand_name) updateFields.name = this.utils.sanitizeStrings(req.body.rb_brand_name);
            if (req.body.write_up) updateFields.write_up = this.utils.sanitizeStrings(req.body.write_up);
        }

        return this.rb_actions.update(req.params.id, updateFields);
    }

    async getUsersRb(req: Request) {
        const { user }: any = req;
        const result = await this.rb_actions.search({ user: user._id });

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;
    }

    async getEveryRb() {
        const result = await this.rb_actions.getAll();

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;

    }

    async webSearch(req: Request, field: string): Promise <I.Result> {
        const searchTerms = this.utils.makeRegex(req.body.rb_search);

        if (searchTerms) {
            const result = await this.rb_actions.search({ [field]: searchTerms });

            if (result.error) return result;

            result.res = await this.utils.format(result.res);

            return result;
        }

        return { res: null };
    }

    async viewRbInfo(req: Request) {
        const rbResult = await this.rb_actions.searchById(req.params.id);

        const name = rbResult.res.name;

        const titlized = this.utils.makeTitle(name);

        rbResult.res.title_name = titlized;

        if (rbResult.error) return rbResult;

        const ratingResult = await this.utils.getRatingsByRbId(req.params.id);

        if (ratingResult.error) return ratingResult;

        await this.utils.prepData(ratingResult.res);

        const avg = this.utils.avgRating(ratingResult.res);

        const res = {
            rb: rbResult.res,
            ratings: ratingResult.res,
            avg
        }

        return { res };
    }
}

export = Rootbeer;

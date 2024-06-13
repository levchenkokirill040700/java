import { Request } from 'express';
import Actions from '../utils/db_actions';
import RatingModel from '../models/rating';
import Utils from './lib/rb_utils';

import * as I from '../interfaces';

class Ratings {
    rating_fields: string[];
    utils: Utils;
    action: Actions;

    constructor() {
        this.rating_fields = [
            'branding',
            'after_taste',
            'aroma',
            'bite',
            'carbonation',
            'flavor',
            'smoothness',
            'sweetness',
        ];

        this.utils = new Utils();
        this.action = new Actions(RatingModel);
    }

    async create(req: Request) {        
        const rating = this.newRating(req);
    
        return this.action.create(rating);
    }

    async update(req: Request) {
       const rating = this.updateRating(req);

       return this.action.update(req.params.id, rating);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }

    getRbRatings(req: Request) {
        return this.action.search({ rb_id: req.params.rb_id });
    }

    async ratingsByUser(req: Request) {
        const { user }: any = req;

        const ratings = await this.action.search({ user: user._id });

        const ratingsDocs = this.utils.getDocs(ratings.res);

        this.utils.formatDate(ratingsDocs);

        await this.utils.addRbName(ratingsDocs);

        ratings.res = ratingsDocs;

        return ratings;
    }

    private newRating(req: Request) {
        const rating: Partial<I.Rating> = this.createNewRatingObject(req);
        rating.total = this.getTotal(rating);
        
        return rating;
    }

    private updateRating(req: Request): Partial <I.Rating> {
        const rating: Partial<I.Rating> = this.createRatingObjectUpdate(req);
        rating.total = this.getTotal(rating);
        
        return rating;
    }

    private createRatingObjectUpdate(req: Request) {
        const rating: Partial<I.Rating> = {
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet,
            comment: this.utils.sanitizeStrings(req.body.comment)
        };

        return rating;
    }

    private createNewRatingObject(req: Request) {
        const { user }: any = req;
    
        const rating: Partial<I.Rating> = {
            rb_id: req.params.id,
            created: new Date(),
            user: user._id,
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet,
            comment: this.utils.sanitizeStrings(req.body.comment)
        };

        return rating;
    }

    private getTotal(rating: Partial<I.Rating>): number {
        let total = 0;

        for (const [key, value] of Object.entries(rating)) {
            if (this.isRatingField(key)) {
                total += (this.points(key, Number(value)));
                rating[key] = Number(value).toFixed(1);
            }
        }
    
        return Math.round(total);
    }

    private points(field: string, value: number): number {
        if (field === 'flavor') {
            return value * 3.25;
        } 

        if (['aroma', 'smoothness', 'after_taste'].includes(field)) {
            return value * 2;  
        }

        if (field === 'carbonation') {
            if (value >= 6.5) return 2.5;
            return value * 0.25;
        }

        if (field === 'bite') {
            if (value >= 6) return 2;
            return value * 0.25;
        }

        if (field === 'sweetness') {
            if (value >= 5 && value <= 8) return 1.5;
            if (value < 5) return value * 0.25;
            if (value > 8) return 10 / value;
        }

        if (field === 'branding') {
            return value * 0.15;
        }

        return 0;
    }

    private isRatingField(key: string) {
        return this.rating_fields.includes(key);
    }

}

export = Ratings;
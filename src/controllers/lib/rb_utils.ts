import UserModel from '../../models/user';
import RBModel from '../../models/rb';
import RatingModel from '../../models/rating';
import escapeString from 'js-string-escape';
import safe from 'safe-regex';
import * as I from '../../interfaces';
import Actions from '../../utils/db_actions';
import * as useful from '../../utils/useful_funcs';


class RbUtils {
    rbActions: Actions;
    ratingActions: Actions;

    constructor() {
        this.rbActions = new Actions(RBModel);
        this.ratingActions = new Actions(RatingModel);
    }

    async addUserName(objArray: (I.RootBeer | I.Rating)[]) {
        for (const i of objArray) {
            const user = await UserModel.findById(i.user);
            i.user = user.username;
        }
    }
 
    formatDate(rbArray: (I.RootBeer | I.Rating | I.WriteUp)[]) {
        for (const i of rbArray) {
            const timeStamp = new Date(i.created);
            
            i.created = useful.formatDate(timeStamp);
        }
    }

    async format(rbArray: I.RootBeer[]) {
        const rbDocs = this.getDocs(rbArray);
    
        await this.addUserName(rbDocs);
        await this.getTotalAvg(rbDocs);

        this.formatDate(rbDocs);
        this.addRBTitle(rbDocs);
        this.rank(rbDocs);

        return rbDocs;
    }

    async addRbName(docArray: I.Rating[]) {
        for (const i of docArray) {
            const result = await this.rbActions.search({ _id: i.rb_id });

            if (result.error) continue;
            if (result.res.length === 0) continue;

            i.rb_name = result.res[0].name;
        }
    }

    addRBTitle(rbDocs: any) {
        for (const doc of rbDocs) {
            doc.title = this.makeTitle(doc.name);
        }
    }

    makeTitle(name: string): string {
        return name.trim().split(' ').map((word) => {
            return word[0].toUpperCase() + word.slice(1, word.length);
        }).join(' ');
    }

    getDocs(docArray: any[]) {
        return docArray.map((i: any) => i._doc);
    }

    async prepData(data: Partial<I.Rating>[] | Partial<I.WriteUp>[]) {
        const docs = this.getDocs(data);

        await this.addUserName(docs);


        this.formatDate(docs);
    }

    getRatingsByRbId(rbId: string) {
        return this.ratingActions.search({ rb_id: rbId });
    }

    async getTotalAvg(rbDocs: I.RootBeer[]) {
        for (const rb of rbDocs) {
            const results  = await this.getRatingsByRbId(rb._id);
            rb.rating = this.totalAvg(results.res);
            rb.popular = results.res.length;
        }
    }

    totalAvg(ratings: I.Rating[]) {
        if (ratings.length) {
            const sum = ratings.reduce((total: number, rating) => {
                total += rating.total;

                return total;
            }, 0)

            return Math.round(sum / ratings.length);
        }

        return 5;
    }

    rank(rbDocs: I.RootBeer[]) {
        rbDocs.sort((a, b) => {
            const r1 = a.rating ? a.rating : 0;
            const r2 = b.rating ? b.rating : 0;
            return r2 - r1;
        });

        rbDocs.forEach((doc, i) => {
            doc.rank = i + 1;
        });
    }

    avgRating(ratings: I.Rating[]) {
        const numerator: number = ratings.length;

        const avgObj: { [propname: string]: any } = {};

        const ratingFields = [
            'branding',
            'after_taste',
            'aroma',
            'bite',
            'carbonation',
            'flavor',
            'smoothness',
            'sweetness',
            'total'
        ];


        for (const rating of ratings) {
            for (const field of ratingFields) {
                if(avgObj[field]) {
                    avgObj[field] += rating[field];

                } else {
                    avgObj[field] = rating[field];
                }
            }
        }

        for (const [key, total] of Object.entries(avgObj)) {
            const avg = total / numerator;
            avgObj[key] = avg.toFixed(1);
        }

        return avgObj;
    }
    
    sanitizeRegex(search: string) {
        const escaped = escapeString(search); 

        if (safe(escaped)) {
            return escaped;
        }

        return null;
    }

    makeRegex(search: string) {
        const sanitized = this.sanitizeRegex(search);

        if (sanitized) {
            try {
                return new RegExp(sanitized, 'i');
            } catch (e) {
                return null
            }
        }

        return null;
    }

    sanitizeStrings(input: string) {
        return String(input).trim();
    }

}

export = RbUtils;
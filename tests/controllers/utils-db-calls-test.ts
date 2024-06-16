import mongoose from 'mongoose';
import Utils from '../../src/controllers/lib/utils';
import RbModel from '../../src/models/rb';
import RatingModel from '../../src/models/rating';
import RootBeerModel from '../../src/models/rb';

const utils = new Utils();

describe('utils', () => {
    beforeAll(async () => {
        const url = `mongodb://localhost/testCactus`;

        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('addUserName', () => {
        it('should add the username to rb docs', async () => {
            const rb: any = await RbModel.findOne();
            await utils.addUserName([rb]);
            
            expect(rb.user).toBe('ciorg');
        });

        it('should add the username to ratings docs', async () => {
            const rating: any = await RatingModel.findOne();
            await utils.addUserName([rating]);
            
            expect(rating.user).toBe('ciorg');
        });
    });

    describe('format', () => {
        it('should format date, add username, and total to Rb docs', async () => {
            const rb: any = await RbModel.findOne();

            const [cloneDoc] = utils.getDocs([rb]);

            utils.formatDate([cloneDoc]);

            await utils.format([rb]);

            const result = rb._doc;
            
            expect(result.user).toBe('ciorg');
            expect(result.created).toBe(cloneDoc.created);
            expect(result.rating).toBeDefined();
            expect(result.rank).toBeDefined();
            expect(result.popular).toBeDefined();
        });
    });

    describe('prepData', () => {
        it('should add username and format date to ratings', async () => {
            const rating: any = await RatingModel.findOne();

            const [cloneDoc] = utils.getDocs([rating]);
            utils.formatDate([cloneDoc]);
            
            await utils.prepData([rating]);

            const result = rating._doc;
            
            expect(result.user).toBe('ciorg');
            expect(result.created).toBe(cloneDoc.created);
        });
    });

    describe('getRatingsById', () => {
        it('should get ratings from rb id', async () => {
            const rb: any = await RbModel.findOne();

            const ratings = await utils.getRatingsByRbId(rb._id);

            ratings.res.forEach((rating: any) => {
                expect(rating.rb_id).toBe(String(rb._doc._id));
                expect(rating.user).toBeDefined();
                expect(rating.branding).toBeDefined();
                expect(rating.flavor).toBeDefined();
                expect(rating.aroma).toBeDefined();
                expect(rating.after_taste).toBeDefined();
                expect(rating.bite).toBeDefined();
                expect(rating.carbonation).toBeDefined();
                expect(rating.sweetness).toBeDefined();
                expect(rating.smoothness).toBeDefined();
                expect(rating.total).toBeDefined();
            });
        });
    });

    describe('addRbName', () => {
        it('should add root beer name to ratings', async () => {
            const rating: any = await RatingModel.findOne();

            const rb: any = await RootBeerModel.findById(rating.get('rb_id'), 'name');

            const ratingDoc = utils.getDocs([rating]);

            await utils.addRbName(ratingDoc);

            for (const doc of ratingDoc) {
                expect(doc.rb_name).toBe('test_0');
            }
        });
    });
});

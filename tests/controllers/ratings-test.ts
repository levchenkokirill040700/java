import mongoose from 'mongoose';
import Ratings from '../../src/controllers/ratings';
import UserModel from '../../src/models/user';
import RBModel from '../../src/models/rb';
import RatingModel from '../../src/models/rating';

describe('ratings', () => {
    let ratings: Ratings;
    let connection: any;
    let user: any;
    let rb: any;

    beforeAll(async () => {
        const url = `mongodb://localhost/ratings_controller`;

        connection = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

         user = await UserModel.register({ 
            username: 'test_user',
            active: true,
            role: 'rater',
            created: new Date()
        }, 'some_pass_sord');

        rb = await RBModel.create({
            name: 'test_rb',
            created: new Date(),
            user: user._id,
            image: 'some/image/location'
        });


        ratings = new Ratings();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        it('should create a rating', async () => {
            const req: any = {
                params: { id: rb._id },
                user: { _id: user._id },
                body: {
                    branding: 9,
                    at: 8,
                    aroma: 9,
                    bite: 6,
                    flavor: 9,
                    smooth: 9,
                    carb: 7,
                    sweet: 5
                }
            };

            const rating = await ratings.create(req);

            ['_id', 'rb_id', 'created', 'user'].forEach((field) => {
                expect(rating.res[field]).toBeDefined();
            });

            expect(rating.res.branding).toBe(9);
            expect(rating.res.after_taste).toBe(8);
            expect(rating.res.aroma).toBe(9);
            expect(rating.res.bite).toBe(6);
            expect(rating.res.carbonation).toBe(7);
            expect(rating.res.flavor).toBe(9);
            expect(rating.res.smoothness).toBe(9);
            expect(rating.res.sweetness).toBe(5);
            expect(rating.res.total).toBe(89);
        });
    });

    describe('update', () => {
        it('should update a rating', async () => {
            const reqCreate: any = {
                params: { id: rb._id },
                user: { _id: user._id },
                body: {
                    branding: 7,
                    at: 4,
                    aroma: 8,
                    bite: 7,
                    flavor: 5,
                    smooth: 9,
                    carb: 6,
                    sweet: 8
                }
            };

            const rating = await ratings.create(reqCreate);

            const reqUpdate: any = {
                params: { id: rating.res._id },
                body: {
                    branding: 10,
                    at: 10,
                    carb: 10,
                    flavor: 10,
                    aroma: 10,
                    bite: 10,
                    smooth: 10,
                    sweet: 7
                }
            }

            const updated = await ratings.update(reqUpdate);

            expect(updated.res.ok).toBe(1);

            const updatedDoc: any = await RatingModel.findById(rating.res._id);

            expect(updatedDoc.get('after_taste')).toBe(10);
            expect(updatedDoc.get('carbonation')).toBe(10);
            expect(updatedDoc.get('flavor')).toBe(10);
            expect(updatedDoc.get('total')).toBe(100);
        });
    });

    describe('delete', () => {
        it('should delete a rating', async () => {
            const req: any = {
                params: { id: rb._id },
                user: { _id: user._id },
                body: {
                    branding: 7,
                    at: 4,
                    aroma: 8,
                    bite: 7,
                    flavor: 5,
                    smooth: 9,
                    carb: 6,
                    sweet: 8
                }
            };

            const rating = await ratings.create(req);

            const delReq: any = {
                params: { id: rating.res._id}
            };
    
            const deleted = await ratings.delete(delReq);

            expect(deleted.res.deletedCount).toBe(1);
        });
    });

    describe('getRbRatings', () => {
        it('get ratings from a rb id', async () => {
            const req: any = {
                params: { id: rb._id },
                user: { _id: user._id },
                body: {
                    branding: 7,
                    at: 4,
                    aroma: 8,
                    bite: 7,
                    flavor: 5,
                    smooth: 9,
                    carb: 6,
                    sweet: 8
                }
            };

            await ratings.create(req);

            const rbReq: any = {
                params: { rb_id: rb._id }
            };

            const rbRatings = await ratings.getRbRatings(rbReq);

            expect(rbRatings.res.length).toBe(3);
        });
    });

    describe('ratingsByUser', () => {
        it('should return ratings by user id', async () => {
            const userReq: any = {
                user: { _id: user._id }
            };

            const rbWriteUps = await ratings.ratingsByUser(userReq);

            expect(rbWriteUps.res.length).toBe(3);
        });
    });
});
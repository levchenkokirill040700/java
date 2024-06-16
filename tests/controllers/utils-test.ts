import Utils from '../../src/controllers/lib/utils';

const utils = new Utils();


describe('controllers utils', () => {
    describe('formatTwoDigit', () => {
        it('should return a 2 digit month', () => {
            const month1 = utils.formatMonth(4);
            const month2 = utils.formatMonth(12);

            expect(month1.length).toBe(2);
            expect(month2.length).toBe(2);
        });

        it('should return string and increment month number by 1', () => {
            const month1 = utils.formatMonth(4);
            const month2 = utils.formatMonth(10);

            expect(month1).toBe('05');
            expect(month2).toBe('11');
        });

        it('should update dec and jan correctly', () => {
            const month1 = utils.formatMonth(11);
            const month2 = utils.formatMonth(0);

            expect(month1).toBe('12');
            expect(month2).toBe('01');
        });
    });

    describe('formatDate', () => {
        it('should return property formated date', () => {
            const date = new Date('2020-07-27T15:30:38.280Z');

            const doc = {
                rb_id: '12345',
                created: date,
                user: 'someUser',
                write_up: 'this is a write up example'
            };

            utils.formatDate([doc]);

            expect(doc.created).toBe('07/27/2020');
        });
    });

    describe('rank', () => {
        it('should return sorted list and add rank to each item', () => {
             let newR = 30;

             const docs = [...new Array(10)].map(() => {
                newR += 5;

                return {
                    created: '2020-07-29T15:01:14.807Z',
                    user: 'test',
                    _id: '1234',
                    name: 'rb',
                    rating: newR,
                    rank: 0
                 };
             });

             utils.rank(docs);

             docs.forEach((doc, i) => {
                expect(doc.rank).toBe(i + 1);
             });
        });
    });

    describe('totalAvg', () => {
        it('should return the average total for all the ratings of a record', () => {
            let total = 47;

            const docs:any = [...new Array(10)].map(() => {
                total += 5;

                return {
                    created: '2020-07-29T15:01:14.807Z',
                    user: 'test',
                    _id: '1234',
                    name: 'rb',
                    total: total,
                    rank: 0
                 };
             });

            const totalAvg = utils.totalAvg(docs);

            expect(totalAvg).toBe(75);
        });
    });

    describe('avgRating', () => {
        it('should return the average ratings for all the categories of a record', () => {
            let rating = 12;

            const docs = [...new Array(10)].map(() => {
                rating += 5;

                return {
                    rb_id: 'tester',
                    created: '2020-07-29T15:01:14.807Z',
                    user: 'test',
                    _id: '1234',
                    branding: rating,
                    after_taste: rating + 2,
                    aroma: rating + 4,
                    bite: rating + 6,
                    carbonation: rating + 8,
                    flavor: rating + 10,
                    smoothness: rating + 12,
                    sweetness: rating + 14,
                    total: rating + 16,
                    comment: 'hello there'
                 };
             });

            const avgRatings = utils.avgRating(docs);

            expect(avgRatings.branding).toBe('39.5');
            expect(avgRatings.after_taste).toBe('41.5');
            expect(avgRatings.aroma).toBe('43.5');
            expect(avgRatings.bite).toBe('45.5');
            expect(avgRatings.carbonation).toBe('47.5');
            expect(avgRatings.flavor).toBe('49.5');
            expect(avgRatings.smoothness).toBe('51.5');
            expect(avgRatings.sweetness).toBe('53.5');
            expect(avgRatings.total).toBe('55.5');
        });
    });
});
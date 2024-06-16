import mongoose from 'mongoose';
import VisitModel from '../../src/models/visit';
import data from '../fixtures/visits_data';
import BotDetector from '../../src/utils/bot_detector';

describe('bot-detector', () => {
    const incomingVisits: any = data.data;
    const bot = new BotDetector();

    beforeAll(async () => {
        const url = 'mongodb://localhost/bot_detector';

        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        incomingVisits.sort((a: any, b: any) => (a.timestamp - b.timestamp));

        incomingVisits[0].os = 'unknown';
        incomingVisits[1].browser = 'undefined'
        delete incomingVisits[2].platform;
        incomingVisits[3].version = undefined;
        incomingVisits[4].path = '/something/path/admin.txt';
        incomingVisits[5].path = '/stuff/andstuff.php';
        incomingVisits[6].path = '/apath/to/things.sql';

        

        for (const visit of incomingVisits) {
            await VisitModel.create(visit);
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('isBot', () => {
        it('should return true if visitor is unknown', async () => {
            const visits = await VisitModel.find();
            
            visits.sort((a, b) => a.get('timestamp') - b.get('timestmap'));

            visits.slice(0, 7).forEach((doc) => {
                expect(bot.isBot(doc)).toBe(true);
            });

            visits.slice(7, visits.length).forEach((doc) => {
                expect(bot.isBot(doc)).toBe(false);
            });
        });
    });
});

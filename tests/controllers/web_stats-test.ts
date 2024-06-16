import mongoose from 'mongoose';
import SiteStats from '../../src/controllers/web_stats';
import IpModel from '../../src/models/ip_address';
import VisitModel from '../../src/models/visit';
import Actions from '../../src/controllers/lib/actions';
import visitData from '../fixtures/visits_data';


const siteStats = new SiteStats();

class Doc {
    timestamp: Date;
    ip_address: string;
    os: string;
    browser: string;
    path: string;
    constructor(args: { timestamp: string, ip_address: string, os: string, browser: string , path: string}) {
        this.timestamp = new Date(args.timestamp);
        this.ip_address = args.ip_address;
        this.os = args.os;
        this.browser = args.browser;
        this.path = args.path;
    }

    get(value: string) {
        return this[value];
    }
}

const monthYear = visitData.monthYear;

const rawDocs = visitData.data;

const docs = rawDocs.map((d) => new Doc(d));

describe('site stats', () => {
    const siteStatProto = Object.getPrototypeOf(siteStats);

    describe('_uniqVisitsOverTime', () => {
        it('should return only uniq visiter for the day', () => {                
            const result = siteStatProto._uniqVisitsOverTime(docs, 'day');
            
            expect(result).toEqual({
                [`${monthYear}-21`]: 3,
                [`${monthYear}-22`]: 1,
                [`${monthYear}-24`]: 1,
                [`${monthYear}-26`]: 2
            });
        });

        it('should return only uniq visiter for the hour', () => {                
            const result = siteStatProto._uniqVisitsOverTime(docs, 'hour');

            expect(result).toEqual({
                [`${monthYear}-21T01:00:00`]: 1,
                [`${monthYear}-21T02:00:00`]: 2,
                [`${monthYear}-22T01:00:00`]: 1,
                [`${monthYear}-22T02:00:00`]: 1,
                [`${monthYear}-22T03:00:00`]: 1,
                [`${monthYear}-24T01:00:00`]: 1,
                [`${monthYear}-26T01:00:00`]: 1,
                [`${monthYear}-26T04:00:00`]: 1
            });
        });
    });

    describe('_getTimesInSec', () => {
        it('should return seconds for each time unit', () => {              
            expect(siteStatProto._getTimesInSec('hour')).toBe(3600000);
            expect(siteStatProto._getTimesInSec('day')).toBe(86400000);
            expect(siteStatProto._getTimesInSec('month')).toBe(86400000 * 30);
            
        });
    });

    describe('_roundTime', () => {
        it('should return time rounded to specified time unit', () => {              
            expect(siteStatProto._roundTime(`${monthYear}-09T18:01:36.274Z`, 'hour')).toBe(`${monthYear}-09T18:00:00`);
            expect(siteStatProto._roundTime(`${monthYear}-09T18:01:36.274Z`, 'day')).toBe(`${monthYear}-09`);
            expect(siteStatProto._roundTime(`${monthYear}-09T18:01:36.274Z`, 'month')).toBe(`${monthYear}`);
            
        });
    });

    describe('_countByTime', () => {
        it('it should count docs by day', () => {
            const countByDay = siteStatProto._countByTime(docs, 'day');
            const countByHour = siteStatProto._countByTime(docs, 'hour');
            const countByMonth = siteStatProto._countByTime(docs, 'month');

            expect(countByDay).toEqual({
                [`${monthYear}-21`]: 4,
                [`${monthYear}-22`]: 3,
                [`${monthYear}-26`]: 2,
                [`${monthYear}-24`]: 1
            });

            expect(countByHour).toEqual({
                [`${monthYear}-21T01:00:00`]: 2,
                [`${monthYear}-21T02:00:00`]: 2,
                [`${monthYear}-22T01:00:00`]: 1,
                [`${monthYear}-22T02:00:00`]: 1,
                [`${monthYear}-22T03:00:00`]: 1,
                [`${monthYear}-24T01:00:00`]: 1,
                [`${monthYear}-26T01:00:00`]: 1,
                [`${monthYear}-26T04:00:00`]: 1
            });

            expect(countByMonth).toEqual({
                [`${monthYear}`]: 10
            });

            expect(totalCounts(countByDay)).toBe(10);
            expect(totalCounts(countByHour)).toBe(10);
            expect(totalCounts(countByMonth)).toBe(10);
        });
    });

    describe('_countByPage', () => {
        const countByPage = siteStatProto._countByField(docs, 'path');
        expect(countByPage).toEqual({
            page1: 6,
            page2: 2,
            page3: 1,
            page4: 1
        });

        expect(totalCounts(countByPage)).toBe(10);
    });

    describe('_sortyByTally', () => {
        const countByVisitor = siteStatProto._countByField(docs, 'browser');
        
        const sorted = siteStatProto._sortTallies(countByVisitor);

        expect(sorted).toEqual([
            ['chrome', 9],
            ['explorer', 1]
        ]);

        expect(totalCounts(countByVisitor)).toBe(10);
    });

    describe('_getTotal', () => {
        it('should get total from tally object', () => {
            const countByPage = siteStatProto._countByField(docs, 'path');

            const totalCount = siteStatProto._getTotal(countByPage);

            expect(totalCount).toBe(10);
        });
    });
});

describe('site stats', () => {
    describe('_addIpCountry', () => {
        beforeAll(async () => {
            const url = `mongodb://localhost/ip_controller`;
    
            await mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            });
            
            const ipActions = new Actions(IpModel);
            const visitActions = new Actions(VisitModel);

            const ipAddress1 = {
                updated: '2020-11-07T04:39:53.854Z',
                ip_address: '1.2.3.4',
                version: 'ipv4',
                region: 'Some Region',
                region_code: 'SR',
                city: 'Moscow',
                country_name: 'Russia',
                country_code: 'RU',
                continent_code: 'EU',
                latitude: 37.3861,
                longitude: 40.1231,
                asn: 'AS15169',
                org: 'Google LLC'   
            };

            const ipAddress2 = {
                updated: '2020-11-07T04:39:53.854Z',
                ip_address: '1.2.3.5',
                version: 'ipv4',
                region: 'Some Region',
                region_code: 'SR',
                city: 'Place',
                country_name: 'United States',
                country_code: 'US',
                continent_code: 'NA',
                latitude: 37.3861,
                longitude: 40.1231,
                asn: 'AS15169',
                org: 'Google LLC'   
            };
 
            await Promise.all([
                ipActions.upsert({ ip_address: '1.2.3.4' }, ipAddress1),
                ipActions.upsert({ ip_address: '1.2.3.5' }, ipAddress2)
            ]);

            await Promise.all(rawDocs.map((doc) => visitActions.create(doc)));
        });
    
        afterAll(async () => {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        });

        it('should add country to ip', async () => {
            const results = await siteStats.getData(12, 'month');
            
            const {
                error,
                uniqueVisits,
                totalVisits,
                uniqueVisitsOverTime,
                totalVisitsOverTime,
                tallyByPage,
                tallyByOs,
                tallyByBrowser,
                tallyByIp,
                tallyByCountry
            } = results;

            expect(error).toBe(false);
            expect(uniqueVisits).toBe(4);
            expect(totalVisits).toBe(10);
            expect(uniqueVisitsOverTime).toEqual({ [`${monthYear}`]: 4 });
            expect(totalVisitsOverTime).toEqual({ [`${monthYear}`]: 10 });
            expect(tallyByPage).toEqual([['page1', 6], ['page2', 2], ['page3', 1], ['page4', 1]]);
            expect(tallyByOs).toEqual([['linux', 9], ['mac', 1]]);
            expect(tallyByBrowser).toEqual([['chrome', 9], ['explorer', 1]]);
            expect(tallyByIp).toEqual([['1.2.3.4', ['Russia', 9]], [ '1.2.3.5', ['United States', 1 ]]]);
            expect(tallyByCountry).toEqual([['Russia', 9], ['United States', 1 ]]);
        });
    });
});

function totalCounts(tally: { [propname: string]: number}): number {
    return Object.values(tally).reduce((count: number, num: number) => {
        const tally = count + num;

        return tally;
    }, 0);
}

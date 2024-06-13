import { Document } from 'mongoose';
import Actions from '../utils/db_actions';
import Visit from '../models/visit';
import Ip from '../models/ip_address';
import Bot from '../utils/bot_detector';
import * as I from '../interfaces';

class SiteStats {
    visit_actions: Actions;
    ip_actions: Actions;
    bot: Bot;

    constructor() {
        this.visit_actions = new Actions(Visit);
        this.ip_actions = new Actions(Ip);
        this.bot = new Bot();
    }

    async getData(period: number, unit: string) {
        const startTime = this._startTime(period, unit);

        const results: I.Result = await this._mongoQuery(startTime);

        const visits = this._removeBots(results.res);

        const uniqueVisitsOverTime = this._uniqVisitsOverTime(visits, unit);
        const totalVisitsOverTime = this._countByTime(visits, unit);
    
        const tallyByPage = this._countByField(visits, 'path');
        const tallyByOs = this._countByField(visits, 'os');
        const tallyByBrowser = this._countByField(visits, 'browser');
        const tallyByIp = this._countByField(visits, 'ip_address');
        const enhancedIp = await this._addIpCountry(tallyByIp);
        const countByCountry = this._countByCountry(enhancedIp);

        return {
            error: results.error || false,
            uniqueVisits: this._uniqCount(visits),
            totalVisits: this._getTotal(totalVisitsOverTime),
            uniqueVisitsOverTime,
            totalVisitsOverTime,
            tallyByPage: this._sortTallies(tallyByPage),
            tallyByOs: this._sortTallies(tallyByOs),
            tallyByBrowser: this._sortTallies(tallyByBrowser),
            tallyByIp: enhancedIp,
            tallyByCountry: this._sortTallies(countByCountry)
        };
    }

    private async _mongoQuery(startDate: string) {
        const botQuery = this.bot.platform_fields.reduce((bQ: any[], field) => {
            const fieldQ = { [field]: { $ne: 'unknown' } };

            bQ.push(fieldQ);

            return bQ;
        }, []);

        return this.visit_actions.search({
            timestamp: { $gte: startDate },
            path: { $ne: '/crypto/cached_markets' },
            $or: botQuery
        });
    }

    private _removeBots(visits: Document[]): Document[] {
        return visits.filter((visit) => !this.bot.isBot(visit));
    }

    private _uniqVisitsOverTime(totalVisits: any[], unit: string) {
        const uniqVisitsByDate: { [prop: string]: string[] } =  totalVisits.reduce((tally, visit) => {
            const date = this._roundTime(visit.get('timestamp').toISOString(), unit);
            const key = this._getVisitorKey(visit);
            
            if (tally[date]) {
                if (tally[date].includes(key)) return tally;

                tally[date].push(key);
                return tally;
            }

            tally[date] = [key];
            return tally;
        }, {});

        const uniqVisitsTally: { [prop: string]: number } = {};

        for (const [key, value] of Object.entries(uniqVisitsByDate)) {
            uniqVisitsTally[key] = value.length;
        }

        return uniqVisitsTally;
    }

    private _startTime(period: number, unit: string) {
        const start = new Date().getTime() - (period * this._getTimesInSec(unit));

        const date = new Date(start).toISOString();

        return this._roundTime(date, unit);
    }

    private _getTimesInSec(unit: string): number {
        const hour = 3600 * 1000;
        const day = 24 * hour;
        const month = 30 * day;

        if(unit === 'day' || unit === 'days') return day;

        if(unit === 'month' || unit === 'months') return month;

        return hour;
    }

    private _roundTime(start: string, unit: string): string {
        if (unit === 'month' || unit === 'months') return start.split('-').slice(0, 2).join('-');
        
        if (unit === 'day' || unit === 'days') return start.split('T')[0];

        return `${start.split(':')[0]}:00:00`;
    }

    private _countByTime(data: Document[], unit: string): { [prop: string]: number } {
        return data.reduce((tally, doc) => {
            const date = this._roundTime(doc.get('timestamp').toISOString(), unit);
            
            if (tally[date]) {
                tally[date] ++;
                return tally;
            }

            tally[date] = 1;
            return tally;
        }, {});
    }

    private _countByField(data: Document[], countField: string): { [prop: string]: number} {
        return data.reduce((tally, doc) => {
            const field = doc.get(countField);

            if (tally[field]) {
                tally[field]++;
                return tally;
            }

            tally[field] = 1;

            return tally;
        }, {});
    }

    private _getTotal(tally: {[prop: string]: number}): number {
        return Object.values(tally).reduce((total: number, value: number) => {
            total += value;
            return total;
        }, 0);
    }

    private _getVisitorKey(doc: Document) {
        return doc.get('ip_address') + doc.get('os') + doc.get('browser');
    }

    private _sortTallies(data: { [prop: string]: number }): [string, number][] {
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }

    private async _addIpCountry(data: { [prop: string]: number }) {
        const enhancedIp:{ [prop: string]: [string, number] } = {};
    
        for (const ip of Object.keys(data)) {
            const result = await this.ip_actions.search({ ip_address: ip });

            if (result.error || result.res.length === 0) continue;

            const country: string = result.res[0].country_name;
            enhancedIp[ip] = [country, data[ip]];
        }

        return Object.entries(enhancedIp).sort((a, b) => b[1][1] - a[1][1])
    }

    private _countByCountry(data: [string, [string, number]][]) {
        const countByCountry: { [prop: string]: number} = {};
        
        for (const ipData of data) {
            const [, [country, count]] = ipData;

            if (countByCountry[country]) {
                countByCountry[country] += count;
                continue;
            }

            countByCountry[country] = count;
        }

        return countByCountry;
    }

    private _uniqCount(data: Document[]) {
        const uniq = data.reduce((uniqDocs, doc) => {
            const key = this._getVisitorKey(doc);

            uniqDocs[key] = true;
            return uniqDocs;
        },{});

        return Object.keys(uniq).length;
    }
}

export = SiteStats;

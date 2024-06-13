import axios from 'axios';
import Actions from './db_actions';
import IpModel from '../models/ip_address';
import Logger from './logger';
import * as I from '../interfaces';

class IpAddress {
    ip_actions: Actions;
    logger: Logger;

    constructor() {
        this.logger = new Logger();
        this.ip_actions = new Actions(IpModel)
    }

    async save(ipAddress: string): Promise<void> {
        const savedIpInfo = await this.ip_actions.search({ ip_address: ipAddress });

        if (savedIpInfo.res && savedIpInfo.res.length > 0 
            && this._within30Days(savedIpInfo.res[0].updated)) return;

        const ipData: I.IPData | undefined = await this._getIpData(ipAddress);

        if (ipData) {
            await this.ip_actions.upsert({ ip_address: ipAddress }, ipData);
        }
    }

    private async _within30Days(date: string): Promise<boolean> {
        return new Date().getTime() - new Date(date).getTime() < 80 * 86400 * 1000;
    }

    private async _getIpData(ipAddress: string): Promise<I.IPData | undefined> {
        const url = `https://ipapi.co/${ipAddress}/json`;
    
        try {
            const result = await axios.get(url);

            const country = ipAddress === '127.0.0.1' ? 'USA' : result.data.country_name;

            return {
                updated: new Date(),
                ip_address: ipAddress,
                version: result.data.version,
                region: result.data.region,
                region_code: result.data.region_code,
                city: result.data.city,
                country_name: country,
                country_code: result.data.country_code,
                continent_code: result.data.continent_code,
                latitude: result.data.latitude,
                longitude: result.data.longitude,
                asn: result.data.asn,
                org: result.data.org    
            };
             
        } catch(e) {
            this.logger.error('could not collect data from ip', { err: e });
        }

        return;
    }
}

export = IpAddress;

import axios from 'axios';
import Configs from './configs';
import Logger from './logger';
import * as I from '../interfaces';


class CoinGeckoApi {
    configs: I.CoinGecko;
    base_url: string;
    logger: Logger;
    market_cap_args: I.MarketCapArgs;

    constructor() {
        this.logger = new Logger();
        
        this.configs = new Configs().getCoinGeckConfigs();
        this.base_url = this.configs.base_url;
        this.market_cap_args = this.configs.market_cap_args;
    }

    async coinList(): Promise<I.CoinList[]> {
        return this._getData('/coins/list');
    }

    async marketCapList(coinIds: string | undefined = undefined): Promise<I.MarketCapListRes[]> {
        let requests = 1;

        if (coinIds == null) {
            requests = Math.ceil(this.market_cap_args.default_size / 100);
        }
        
        const optionArray = [];

        for (let i = 1; i <= requests; i++) {
            const options: I.MarketCapApiOptions = {
                vs_currency: this.market_cap_args.vs_currency,
                order: this.market_cap_args.order,
                per_page: this.market_cap_args.per_page,
                page: i,
                sparkline: this.market_cap_args.sparkline,
                price_change_percentage: this.market_cap_args.price_change_percentage
            };

            if (coinIds) {
                options.ids = coinIds;
            }

            optionArray.push(options);
        }

        const marketDataArray: I.MarketCapListRes[][] = await Promise.all(
            optionArray.map((opt) => this._getData('/coins/markets', opt))
        );


        const data = marketDataArray.reduce((flat, res) => {
            if (res != null && res.length > 0) {
                res.forEach((r) => flat.push(r))
            }
    
            return flat
        }, []);
        
        return data;
    }

    async coinData(symbol: string): Promise<I.CoinDataRes | null> {
        const marketOpts = {
            id: symbol,
            localization: false,
            tickers: true,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
        }

        const data = await this._getData(`/coins/${symbol}`, marketOpts);

        if (data == null) return null;

        return data;
    }

    async coinMarketHistory(args: I.CoinMarketHistoryArgs): Promise<I.CoinMarketHistoryResp | null> {
        const opts = {
            id: args.id,
            vs_currency: args.vs,
            days: args.days,
            interval: args.interval
        };

        const data = await this._getData(`/coins/${opts.id}/market_chart`, opts);

        if (data == null) return null;

        return data;
    }

    private async _getData(extention: string, options = {}) {
        const config = Object.assign({ timeout: 10 }, options);

        try {
            const res = await axios.get(
                `${this.base_url}${extention}`,
                {
                    params: config
                }
            );
           
            if (res.status !== 200) {
                this.logger.error(`crypto api returned with ${res.status}`, {});
                return;
            }
            
            return res.data;
        } catch (e: any) {
            this.logger.error(`${extention}: ${e.message}`, e);
        }
    }

}

export = CoinGeckoApi;

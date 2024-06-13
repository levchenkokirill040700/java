import { Request } from 'express';
import CoinGeckoApi from '../utils/coingecko_api';
import CoinModel from '../models/coin';
import ExchangeModel from '../models/coin_exchange'; 
import CategoriesModel from '../models/crypto_category';
import DbActions from '../utils/db_actions';
import Logger from '../utils/logger';
import cache from '../utils/gecko_cache';

import * as I from '../interfaces';

class CryptoData {
    logger: Logger;
    api: CoinGeckoApi;
    dbCoins: DbActions;
    dbCats: DbActions;
    dbExchanges: DbActions;
    cache: typeof cache;

    constructor() {
        this.cache = cache;
        this.api = new CoinGeckoApi();
        this.logger = new Logger();
        this.dbCoins = new DbActions(CoinModel);
        this.dbExchanges = new DbActions(ExchangeModel);
        this.dbCats = new DbActions(CategoriesModel);
    }

    async addCoin(req: Request) {
        const newCoin = {
            date: new Date().toISOString(),
            coin_id: this._cleanCoinId(req.body.coin_name),
            symbol: req.body.symbol
        };
    
        return this.dbCoins.create(newCoin);
    }

    async addExchange(req: Request) {       
        const newExchange = {
            date_added: new Date().toISOString(),
            active: true,
            name: req.body.exchange_name.toLowerCase(),
            website_url: req.body.website,
            coin_gecko_id: req.body.coin_gecko_id
        };
    
        return this.dbExchanges.create(newExchange);
    }

    async getExchangesNames(): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        }

        const response = await this.dbExchanges.getAll();

        if (response.res.length) {
            result.res = response.res.map((exchange: I.Exchange) => exchange.name)
            .sort();

            return result;
        }

        result.error = true;
        return result;
    }

    async getExchangeNameById(id: string): Promise<string> {
        const result = await this.dbExchanges.searchById(id);

        if (result.res) {
            return result.res.name;
        }

        return '';
    }

    async getExchangeId(name: string): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        }

        const response = await this.dbExchanges.search({ name });

        const { res } = response;

        if (res.length === 1) {
            result.res = res[0]._id;

            return result;
        }

        result.error = true;
        return result;
    }

    async getCoinSymbols(): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };
    
        try {
            const response = await this.dbCoins.getAll();
            result.res = response.res.map((coin: I.Coin) => coin.symbol).sort();
    
            return result;
        } catch(e: unknown) {
            this.logger.error('error fetching user crypto portfolio', { err: e });
            result.error = true;
            return result;
        }
    }

    async getCoinSymbolById(id: string): Promise<string> {
        const result = await this.dbCoins.searchById(id);

        if (result.res) return result.res.coin_id;

        return '';
    }

    async getCoinId(symbol: string): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };
    
        const response = await this.dbCoins.search({ symbol });

        const { res } = response;

        if (res.length === 1) {
            result.res = res[0]._id;

            return result;
        }

        result.error = true;
        return result;
    }

    async getCoinList(): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const {
            prepped,
            categoryInfo,
            cache_time 
         } = await this._getMarketCapPageData();

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo,
                cache_time
            }
            return result;
        }

        result.error = true;
        return result;
    }

    async getCoinData(historyOpts: { id: string, unit: string, value: number }): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const marketData: I.CoinDataRes = await this.cache.getCoinData(historyOpts.id);

        if (marketData) {
            const data = {
                market_data: this._formatCoinMarketData(marketData)
            };

            result.res = data;
            return result;
        }

        result.error = true;
        return result;
    }

    async coinsByCat(category: string) {
        const result: I.Result = {
            res: undefined
        };
    
        const coinIds = await this._getCoinIdsInCategory(category);

        const {
            prepped,
            categoryInfo,
            cache_time 
         } = await this._getMarketCapPageData(coinIds);

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo,
                cache_time
            }
            return result;
        }

        result.error = true;

        return result;
    }

    async coinsByCatCode(code: string) {
        const result: I.Result = {
            res: undefined
        };
    
        const fullCatNames = await this._getCategoriesFromCode(code);

        const pResp = await Promise.all(fullCatNames.map((cat) => this._getCoinIdsInCategory(cat)));

        const coinIds = pResp.reduce((ids, id) => {
            if (id.length) id.forEach((id) => ids.push(id));

            return ids
        }, []);

        const {
            prepped,
            categoryInfo,
            cache_time 
         } = await this._getMarketCapPageData(coinIds);

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo,
                cache_time
            }
            return result;
        }

        result.error = true;

        return result;
    }

    private async _getMarketCapPageData(coinIdList: string[] = []) {
        let coinIds: string | undefined;
    
        if (coinIdList.length) {
            coinIds = coinIdList.join(',');
        }
    
        const { data, cache_time } = await this.cache.getMarketData(coinIds);

        const [prepped, categoryInfo] = await Promise.all([
            this._prepCoinListData(data),
            this._getCategoryInfo()
        ]);

        return {
            prepped,
            categoryInfo,
            cache_time
        };
    }

    private async _prepCoinListData(data: I.MarketCapListRes[]) {
        const returnData = [];

        for (const coin of data) {
            const categories = await this._getCategories(coin.id);

            const info = {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.current_price,
                market_cap: coin.market_cap,
                change_per: coin.price_change_percentage_24h,
                categories
            };

            returnData.push(info);
        }

        return returnData;
    }

    private async _getCategoriesFromCode(code: string): Promise<string[]> {
        const result = await this.dbCats.search({ code });

        if (result.res.length > 0) {
            return result.res.map((res: any) => res.full);
        }

        return [];
    }

    private async _getCoinIdsInCategory(categories: string): Promise<string[]> {
        const result = await this.dbCoins.search({ categories });

        if (result.res.length === 0) return [];
    
        return result.res.map((res: any) => res.coin_id)
    }

    private async _getCategories(coin_id: string): Promise<string[]> {
        const result = await this.dbCoins.search({ coin_id });
        
        if (result.res.length > 0) {
            const { categories } = result.res[0]

            const pResp: (string | null)[] = await Promise.all(
                categories.map((cat: string) => this._getCodeFromCategory(cat))
            );

            return pResp.reduce((coinCats: string[], r: string | null) => {
                if (r != null && !coinCats.includes(r)) {
                    coinCats.push(r);
                }

                return coinCats;
            }, []);
        }

        return [];
    }

    private async _getCodeFromCategory(category: string): Promise<string | null> {
        const codeResult = await this.dbCats.search({ key: this._normalizeCategory(category) });

        if (codeResult.res.length) {
            return codeResult.res[0].code;
        }
        
        this.logger.info(`could not find code for ${category}`);

        return null;
    }

    private _normalizeCategory(category: string): string {
        return category.replace(/\s|\W/g, '');
    }

    private _formatCoinMarketData(data: I.CoinDataRes) {
        return {
            id: data.id,
            name: data.name,
            symbol: data.symbol.toUpperCase(),
            homepage: data.links.homepage[0],
            image: data.image.large,
            start_date: this._formatDate(data.genesis_date),
            current_price: this._formatNum(data.market_data.current_price.usd),
            ath: this._formatNum(data.market_data.ath.usd),
            ath_date: this._formatDate(data.market_data.ath_date.usd),
            market_cap: this._marketCap(data.market_data.market_cap.usd),
            rank: data.market_data.market_cap_rank,
            high_24h: this._formatNum(data.market_data.high_24h.usd), 
            low_24h: this._formatNum(data.market_data.low_24h.usd),
            categories: data.categories,
            description: data.description.en,
            exchanges: this._getCoinExchanges(data.tickers),
            max_supply: this._formatNum(this._getCoinSupply(data.market_data)),
            circulating_supply: this._formatNum(
                data.market_data.circulating_supply,
                { maximumFractionDigits: 0 }
            )
        }
    }

    private _getCoinSupply(market_data: I.CoinMarketData): number {
        const max = market_data.max_supply;
        const total = market_data.total_supply;

        if (max && total) {
            if (max > total) return max;
            return total;
        }

        if (max) return max;

        return total;
    }

    private _marketCap(value: number): string {
        if (value < 1000000) {
            const thousands = value / 1000;
            return `${this._formatNum(thousands, { maximumFractionDigits: 0 })} Th`;
        }
    
        if (value < 1000000000000) {
            const millions = value / 1000000;
            return `${this._formatNum(millions, { maximumFractionDigits: 0 })} M`;
        }

        const billions = value / 1000000000
        return `${this._formatNum(billions, { maximumFractionDigits: 0 })} B`;
    }

    private _getCoinExchanges(tickers: I.CoinDataTickers[]) {
        const targets = [
            'btc',
            'usdt',
            'usd',
            'usdc',
            'eth',
            'xbt'
        ];

        const exchanges = tickers.reduce((exchanges: I.CGExchangeInfo[], ticker) => {
            if (ticker.trade_url && targets.includes(ticker.target.toLowerCase())) {
                const exData = {
                    name: ticker.market.name,
                    target: ticker.target,
                    trust_score: ticker.trust_score,
                    trade_url: ticker.trade_url,
                    volume: this._formatNum(ticker.volume)
                }

                exchanges.push(exData);
            }

            return exchanges;
        }, []);

        return exchanges.sort((a, b) => Number(b.volume) - Number(a.volume));
    }

    private _formatDate(value: string): string {
        if (value) {
            const [year, month, date] = value.split('-');
        
            return `${month}/${date.split('T')[0]}/${year}`;
        }

        return 'na';
    }

    private _formatNum(value: number, options: { [key: string]: any } = {}) {
        return Number(value).toLocaleString('en', options);
    }

    private async _getCategoryInfo() {
        const result = await this.dbCats.getAll();

        const catInfo = this._gatherCategories(result.res);

        return this._sortCategories(catInfo);
    }

    private _gatherCategories(catResponse: any[]): { [key: string]: string[] }  {
        const categories: { [key: string]: string[] } = {};

        if (catResponse.length) {
            for (const cat of catResponse) {
                if (categories[cat.code]) {
                    categories[cat.code].push(cat.full);
                    continue;
                }
    
                categories[cat.code] = [cat.full];
            }
        }

        return categories;
    }

    private _sortCategories(gatheredCats: { [key: string]: string[] }) {
        return Object.keys(gatheredCats).reduce((catArray: any, key) => {
            catArray.push([key, gatheredCats[key]]);
            return catArray;
        }, []).sort((a: string, b: string) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });
    }

    private _cleanCoinId(coinId: string): string {
        let id = coinId.trim().toLowerCase();

        return id.replace(/\s/g, '-');
    }
    
    // Still could be use full code for historical data one day
    // private _formatHistoryOpts(opts: I.CoinOpts): I.CoinMarketHistoryArgs {
    //     return {
    //         id: opts.id,
    //         vs: 'usd',
    //         days: this._makeDays(opts),
    //         interval: this._getInterval(opts)
    //     };
    // }

    // _makeDays(opts: I.CoinOpts) {
    //     if (opts.unit === 'years') {
    //         return opts.value * 365;
    //     }

    //     if (opts.unit === 'weeks') {
    //         return opts.value * 7;
    //     }

    //     if (opts.unit === 'months') {
    //         return opts.value * 30;
    //     }

    //     return opts.value;
    // }

    // private _getInterval(opts: I.CoinOpts): string {
    //     if (opts.unit === 'days' && opts.value === 1) {
    //         return 'minutely';
    //     }

    //     if ((opts.unit === 'days' && opts.value < 31)
    //         || (opts.unit === 'months' && opts.value < 2)
    //         || (opts.unit === 'weeks' && opts.value < 5)) {
    //         return 'hourly';
    //     }

    //     return 'daily';
    // }
}

export = CryptoData;

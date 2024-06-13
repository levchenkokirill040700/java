import CoinGeckoApi from './coingecko_api';
import Logger from './logger';
import Configs from './configs';
import * as I from '../interfaces';

const logger = new Logger();
const cacheConfig = new Configs().getCacheConfigs();

const cache: { [key: string]: any } = {};

const api = new CoinGeckoApi();

async function initializeCache(): Promise<void> {
    logger.info('inializing cache for marketcaps')
    await setMarketData();
    updateMarketCaps();
}

async function getMarketData(coinIds: string | undefined = undefined): Promise<I.CacheMarketsResponse> {
    if (coinIds) {
        const coinList = await api.marketCapList(coinIds);

        return {
            data: coinList,
            cache_time: new Date()
        };
    }

    return cache.markets;
}

async function setMarketData(): Promise<void> {
    const data = await api.marketCapList();
    
    cache.markets = {
        data,
        cache_time: new Date()
    };

    logger.info(`updated market caps`);
}

async function updateMarketCaps(): Promise<void> {
    setInterval(() => {
        logger.info('updating market cap cache');
        setMarketData();
    }, cacheConfig.update_market_caps);
}

async function getCoinData(id: string) {
    const now = new Date();

    if (cache[id] != null) {
        return _cacheResponse(id, now);
    }

    logger.info(`${id} is not cached`);
    
    return _coinApiCall(id);
}

async function _cacheResponse(id: string, now: Date) {
    const cachedData = (cache[id]);

    logger.info(`found ${id} in cache`);

    if (_expired(now, cachedData.cache_time)) {
        logger.info(`${id} cache expired: ${now} > ${cachedData.cache_time}`);
        return _coinApiCall(id);
    }


    logger.info(`returning ${id} data from cache`);
    return cachedData.data;
}

function _expired(now: Date, cacheTime: Date): boolean {
    return (now.getTime() - cacheTime.getTime()) > cacheConfig.coin_expiration;
}

async function _coinApiCall(id: string) {
    const data = await api.coinData(id);

    cache[id] = {
        data,
        cache_time: new Date()
    };

    return data;
}

export = {
    initializeCache,
    getMarketData,
    getCoinData
};

import axios, { AxiosResponse } from 'axios';
import Logger from '../utils/logger';

const logger = new Logger();
const url = 'https://api.coingecko.com/api/v3/coins/markets';

export async function saveMarketCapData(): Promise<void> {
    const data = await _fetchData('usd', 100);
}

async function _fetchData(currency: string, size = 100) {
    const options = {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: size,
        page: 1,
        sparkline: false
    };

    const data = await _getData(options);

    if (data == null) return;

    return data.map((coin: any) => {
        const info = {
            id: coin.id,
            symbol: coin.symbol,
            price: coin.current_price,
            market_cap: coin.market_cap,
            change_per: coin.price_change_percentage_24h
        };

        return info;
    });
}

async function _getData(options = {}) {
    try {
        const axiosRes = await axios.get(
            `${url}`,
            {
                params: options
            }
        );

        if (axiosRes.status !== 200) {
            logger.error(`crypto api returned with ${axiosRes.status}`, {});
            return;
        }
        
        return axiosRes.data;
    } catch (e: any) {
        logger.error(e.message, e);
    }
}


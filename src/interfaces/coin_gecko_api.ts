
export type ChangeOptions = '1h'|'24h'|'7d'|'14d'|'30d'|'200d'|'1y';
export type MarketCapOrderOptions = 'market_cap_desc' | 'market_cap_asc'| 'gecko_desc'| 'gecko_asc' | 'volume_asc' | 'volume_desc' | 'id_asc' | 'id_desc';

export interface MarketCapListArgs {
    vs: string;
    size: number;
    per_price_change?: ChangeOptions;
    per_page?: number;
    coin_list?: string;
}

export interface MarketCapApiOptions {
    vs_currency: string;
    ids?: string;
    category?: string;
    order: MarketCapOrderOptions
    per_page: number;
    page: number;
    sparkline: boolean;
    price_change_percentage: ChangeOptions
}

export interface MarketCapListRes {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: null;
    last_updated: string;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_7d_in_currency?: number;
    price_change_percentage_14d_in_currency?: number;
    price_change_percentage_30d_in_currency?: number;
    price_change_percentage_200d_in_currency?: number;
    price_change_percentage_1y_in_currency?: number;
    categories: string[];
}

export interface CoinDataRes {
    id: string;
    symbol: string;
    name: string;
    asset_platform_id: string | number | null;
    platforms: { [key: string]: string },
    block_time_in_minutes: number | null;
    hashing_algorithm: string;
    categories: string[];
    description: { en: string };
    links: CoinDataLinks;
    image: CoinDataImage;
    country_origin: string;
    genesis_date: string;
    sentiment_votes_up_percentage: number;
    sentiment_votes_down_percentage: number;
    market_cap_rank: number;
    market_data: CoinMarketData;
    tickers: CoinDataTickers[];
}

interface CoinDataLinks {
    homepage: string[];
    blockchain_site: string[];
    official_forum_site: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
        github: string[];
        bitbucket: string[];
    }
}

interface CoinDataImage {
    thumb: string;
    small: string;
    large: string;
}

export interface CoinMarketData {
    current_price: TargetCoins;
    ath: TargetCoins;
    ath_change_percentage: TargetCoins;
    ath_date: TargetCoinsString;
    market_cap: TargetCoins;
    market_cap_rank: number;
    high_24h: TargetCoins;
    low_24h: TargetCoins;
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    total_supply: number;
    max_supply: number;
    circulating_supply: number;
}

interface TargetCoins {
    usd: number;
    eth: number;
}

interface TargetCoinsString {
    usd: string;
    eth: string;
}

export interface CoinDataTickers {
    base: string;
    target: string;
    market: {
        name: string;
        identifier: string;
        has_trading_incentive: boolean; 
    },
    last: number;
    volume: number;
    trust_score: string,
    trade_url: string | null;
    coin_id: string;
    target_coin_id: string;
}

export interface CoinMarketHistoryArgs {
    id: string;
    vs: string;
    days: string | number;
    interval: string;
}

export interface CoinMarketHistoryResp {
    prices: number[][];
    market_caps: number[][];
    total_volumes: number[][];
}

export interface CoinList {
    id: string;
    symbol: string;
    name: string;
}
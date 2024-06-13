export interface CGExchangeInfo {
    name: string;
    target: string;
    trust_score: string;
    trade_url: string;
    volume: string;
}

export interface CoinOpts {
    id: string;
    unit: string;
    value: number
}

export interface Exchange {
    name: string;
    _id: string;
    active: boolean;
    date_added: Date;
    website_url: string
}

export interface Coin {
    date: Date;
    coin_id: string;
    symbol: string;
    categories: string[];
}

export interface TransactionsByCoin {
    [coin_id: string]: Transaction[];
}

export interface Transaction {
    date: Date;
    exchange: string;
    price: number;
    size: number;
    fee: number;
    type: 'buy' | 'sell';
    pool_id: 'loan' | 'fiat' | 'reinvestment';
    _id: string;
}

export interface TransactionsWithSummary {
    summary: Summary;
    transactions: string;
}

export interface Summary {
    own: string;
    cost: string;
    avg_price: string;
    current_price: string;
    current_value: string;
    price_diff: string;
    cost_cv_diff: string;
    symbol: string;
    coin_id: string;
    loan: string;
    reinvestment: string;
    fiat: string;
    sold: string;
    sold_value: string;
    avg_sell_price: string;
}

export interface CurrentPrices {
    [coin_id: string]: [number, string];
}

export interface TransactionsTally {
    loan: number;
    fiat: number;
    reinvestment: number;
    cost: number;
    own: number;
    sold: number;
    soldValue: number;
}

export interface GrandTally {
    portfolio_value: string;
    total_cost: string;
    value_gain: string;
    p_gain: string,
    loan: string;
    reinvestment: string;
    fiat: string;
}
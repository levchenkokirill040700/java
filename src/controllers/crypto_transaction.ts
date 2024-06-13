import { Request } from 'express';
import Actions from '../utils/db_actions';
import CryptoTransactionModel from '../models/crypto_transaction';
import CryptoData from './crypto_data';
import Pool from './pool';
import * as useful from '../utils/useful_funcs';

import * as I from '../interfaces';

class CoinPurchase {
    action: Actions;
    cryptoData: CryptoData;
    pool: Pool;

    constructor() {
        this.action = new Actions(CryptoTransactionModel);
        this.cryptoData = new CryptoData();
        this.pool = new Pool();
    }

    async create(req: Request) {
        const { user }: any = req;

        const coinId = await this.cryptoData.getCoinId(req.body.coin);
        const poolId = await this.pool.getId(req.body.pool);
       
        const coinTransactionData = {
            date: req.body.date,
            coin_id: coinId.res,
            exchange: req.body.exchange,
            price: req.body.price,
            size: req.body.size,
            fee: req.body.fee,
            user_id: user._id,
            type: req.body.type,
            pool_id: poolId.res

        };
    
        return this.action.create(coinTransactionData);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }


    async getTransactions(req: Request): Promise<[I.TransactionsWithSummary[], I.GrandTally, Date]> {
        const { user }: any = req;

        const results = await this.action.search({ user_id: user._id });

        const transactionsByCoin = await this.organizeTransactions(results.res);
       
        const [currentPrices, cacheTime] = await this.getCurrentPrice(Object.keys(transactionsByCoin));

        const summary = await this.createSummary(transactionsByCoin, currentPrices);

        const grandTally = this.grandTally(summary);

        return [summary, grandTally, cacheTime];
    }

    async organizeTransactions(transactions: any[]): Promise<I.TransactionsByCoin> {
        const transactionsByCoin: I.TransactionsByCoin = {};

        for (const transaction of transactions) {
            const coinName = await this.cryptoData.getCoinSymbolById(transaction.coin_id);

            if (transactionsByCoin[coinName]) {
                transactionsByCoin[coinName].push(transaction);
                continue;
            }

            transactionsByCoin[coinName] = [transaction]
        }

        return transactionsByCoin;
    }

    async getCurrentPrice(coinIds: string[]): Promise<[I.CurrentPrices, Date]> {
        const { data, cache_time } = await this.cryptoData.cache.getMarketData(coinIds.join());

        const currentPrices = data.reduce((cp: I.CurrentPrices, coinData) => {
            cp[coinData.id] = [coinData.current_price, coinData.symbol];

            return cp;
        }, {});


        return [currentPrices, cache_time];
    }

    async createSummary(
        transactionsByCoin: I.TransactionsByCoin,
        currentPrices: I.CurrentPrices
        ): Promise<I.TransactionsWithSummary[]> {
        const transactionsWithSummary: I.TransactionsWithSummary[] = [];

        await Promise.all(Object.entries(transactionsByCoin)
            .map(([coinId, transactions]) => this._includeSummary(
                currentPrices,
                coinId,
                transactions,
                transactionsWithSummary
            ))
        );

        transactionsWithSummary
            .sort((a, b) => useful.currencyToNumber(b.summary.current_value) - useful.currencyToNumber(a.summary.current_value));

        return transactionsWithSummary;
    }

    private async _includeSummary(
        currentPrices: I.CurrentPrices,
        coinId: string, 
        transactions: I.Transaction[],
        transactionsWithSummary: I.TransactionsWithSummary[]
    ) {
        const [currentPrice, symbol] = currentPrices[coinId];

        if (currentPrice == null) return;

        const tSummary = await this._calculateSummary(
            currentPrice,
            symbol,
            coinId,
            transactions
        )

        transactionsWithSummary.push(tSummary);
    }

    private async _calculateSummary(
        currentPrice: number,
        symbol: string,
        coinId: string,
        transactions: I.Transaction[]
        ) {
        const {
            loan,
            fiat,
            reinvestment,
            cost,
            own,
            sold,
            soldValue
        } = (await this.tallyTransactions(transactions));

        const currentValue = (currentPrice * own);

        const avgPurchasePrice = cost > 0 ? cost / own : 0.00;

        const pPriceDiff = cost > 0 ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0.00;

        const formatedTrans = await this.formatTransactions(transactions);

        return {
            summary: {
                own: useful.setDecimals(own),
                current_price: useful.toCurrency(currentPrice),
                avg_price: useful.toCurrency(avgPurchasePrice),
                price_diff: useful.setDecimals(pPriceDiff, 2),
                current_value: useful.toCurrency(currentValue),
                cost: cost > 0 ? useful.toCurrency(cost) : useful.toCurrency(0),
                loan: useful.toCurrency(loan),
                fiat: useful.toCurrency(fiat),
                reinvestment: useful.toCurrency(reinvestment),
                cost_cv_diff: useful.toCurrency(currentValue - cost),
                sold: useful.setDecimals(sold),
                sold_value: useful.toCurrency(soldValue),
                avg_sell_price: useful.toCurrency(soldValue / sold),
                symbol,
                coin_id: coinId
            },
            transactions: JSON.stringify(formatedTrans)
        };
    }

    async tallyTransactions(transactions: I.Transaction[]): Promise<I.TransactionsTally> {
        const tracker: I.TransactionsTally = {
            loan: 0,
            fiat: 0,
            reinvestment: 0,
            cost: 0,
            own: 0,
            sold: 0,
            soldValue: 0
        };


        try {
            await Promise.all(transactions.map((t) => this._addTransaction(t, tracker)));
        } catch (e) {
            throw new Error('coult not process transactions');
        }

        return tracker;
    }

    private async _addTransaction(transaction: I.Transaction, tracker: I.TransactionsTally) {
        const poolType = await this.pool.getType(transaction.pool_id);

        const tValue = (transaction.price * transaction.size) - transaction.fee;

        if (transaction.type === 'buy') {
            tracker.cost += tValue;
            tracker.own += transaction.size;
            if (poolType === 'loan') tracker.loan += tValue;
            if (poolType === 'fiat') tracker.fiat += tValue;
            if (poolType === 'reinvestment') tracker.reinvestment -= tValue;
        }
        
        if (transaction.type === 'sell') {
            tracker.sold += transaction.size;
            tracker.soldValue += tValue;
            tracker.cost -= tValue;
            tracker.own -= transaction.size;
            if (poolType === 'loan') tracker.loan -= tValue;
            if (poolType === 'fiat') tracker.fiat -= tValue;
            if (poolType === 'reinvestment') tracker.reinvestment += tValue;
        }
    }

    async formatTransactions(transactions: I.Transaction[]) {
        const formatedTransactions: any[][] = [];

        await Promise.all(transactions.map((t) => this._applyFormating(t, formatedTransactions)));

        formatedTransactions.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        return formatedTransactions;
    }

    private async _applyFormating(t: I.Transaction, formated: any[][]) {
        const poolName = await this.pool.getName(t.pool_id);

        formated.push([
            useful.formatDate(t.date),
            t.exchange,
            t.type,
            poolName,
            useful.setDecimals(t.size, 4),
            useful.toCurrency(t.price),
            useful.toCurrency(t.price * t.size),
            t._id
        ]);
    }

    grandTally(summaries: I.TransactionsWithSummary[]): I.GrandTally {
        let portfolioValue = 0;
        let fiat = 0;
        let loan = 0;
        let reinvestment = 0;

        for (const sum of summaries) {
            portfolioValue += useful.currencyToNumber(sum.summary.current_value);
            fiat += useful.currencyToNumber(sum.summary.fiat);
            loan += useful.currencyToNumber(sum.summary.loan);
            reinvestment += useful.currencyToNumber(sum.summary.reinvestment);
        }

        portfolioValue += reinvestment;
        const realValue = portfolioValue - loan;

        return {
            portfolio_value: useful.toCurrency(portfolioValue),
            total_cost: useful.toCurrency(fiat),
            value_gain: useful.toCurrency(realValue - fiat),
            p_gain: useful.setDecimals(((realValue / fiat) - 1) * 100, 2),
            fiat: useful.toCurrency(fiat),
            loan: useful.toCurrency(loan),
            reinvestment: useful.toCurrency(reinvestment)
        };
    }
}

export = CoinPurchase;

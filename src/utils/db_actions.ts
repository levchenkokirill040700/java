import { Document } from 'mongoose';
import * as I from '../interfaces';
import Logger from './logger';

class Actions {
    log: Logger;
    model: any;

    constructor(model: any) {
        this.log = new Logger();
        this.model = model;
    }

    protected async _modelAction(action: string, params: any, fields?: any): Promise<I.Result> {
        const result: I.Result = { res: null };
        
        try {
            const res: Document[] = await this.model[action](params, fields);
            
            this.log.debug(`successfully completed ${action} for ${JSON.stringify(params)}`);
            
            result.res = res;
        } catch(e: any) {
            this.log.error(e.message, { err: e });
            result.error = true;
        }
        
        return result;
    }

    create(params: any, fields?: any) {
        return this._modelAction('create', params, fields);
    };

    async update(id: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };

        if (Object.keys(params).length) {
            try {
                result.res = await this.model.updateOne({ _id: id }, params);
                this.log.debug(`updated ${id}, ${params}`)
            } catch (e: any) {
                this.log.error(e.message, { err: e });
                result.error = true;
            }
        }

        return result;
    }

    async upsert(
        query: { [params: string]: any },
        record: { [params: string]: any },
        options: { [params: string]: any} = {}
    ) {
        const result: I.Result = { res: null };

        const defaultOptions = {
            upsert: true,
            overwrite: false,
            new: true
        };

        const queryOptions = Object.assign({}, options, defaultOptions);

        try {
            result.res = await this.model.findOneAndUpdate(
                query,
                record,
                queryOptions
            );
        } catch (e: any) {
            this.log.error(e.message, { err: e });
            result.error = true;
        }

        return result;
    }

    delete(id: string) {
        return this._modelAction('deleteOne', { _id: id });
    }

    search(params: { [key: string]: any }, fields = {}) {
        return this._modelAction('find', params, fields);
    }

    searchById(id: string) {
        return this._modelAction('findById', id);
    }

    getAll() {
        return this._modelAction('find', {});
    }
}

export = Actions;

import jsYaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import * as I from '../interfaces';

class Configs {
    configs: any;
    constructor() {
        const file = fs.readFileSync(path.join(process.cwd(), 'config.yaml'), 'utf8');

        this.configs = jsYaml.load(file);
    }

    getConfigs(): I.ConfigSettings {
            return this.configs;
    }

    getCoinGeckConfigs(): I.CoinGecko {
        return this.configs.coin_gecko;
    }

    getWebSiteConfigs(): I.WebSite {
        return this.configs.web_site;
    }

    getMongoConfigs(): I.Mongo {
        return this.configs.mongo_settings;
    }

    getLogConfigs(): I.Logger {
        return this.configs.log;
    }

    getCacheConfigs(): I.Cache {
        return this.configs.cache;
    }
}

export = Configs;
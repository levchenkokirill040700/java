import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import * as fs from 'fs-extra';
import path from 'path';

class Scrape {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    async getHTML(): Promise<AxiosResponse> {
        return axios.get(this.url);
    }

    async parseSearchResult() {
        // const html = await this.getHTML();

        // console.log(JSON.stringify(html.data));

        const data = fs.readFileSync(path.join(process.cwd(), 'coinna.html'), 'utf-8');

        const parsed = cheerio.load(data);

        console.log(parsed);
    }

    // get site info
    // parse info

}

const scrape = new Scrape('https://www.coinna.com/search/xrp');

scrape.parseSearchResult();

// export = Scrape;

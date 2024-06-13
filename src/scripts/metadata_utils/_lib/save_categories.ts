import fs from 'fs-extra';
import path from 'path';
import CryptoCategoryModel from '../../../models/crypto_category';
import DbActions from '../../../utils/db_actions';
import DB from '../../../utils/db';
import Logger from '../../../utils/logger';

interface CryptoCode {
    [key: string]: CodeValue
}

interface CodeValue {
    full: string;
    code: string;
}

class SaveCryptoCategories {
    dbActions: DbActions;
    logger: Logger;

    constructor() {
        this.dbActions = new DbActions(CryptoCategoryModel);
        this.logger = new Logger();
    }

    async saveCategories() {
        const db = new DB();
        await db.connect();

        const categories: CryptoCode = fs.readJsonSync(path.join(process.cwd(), 'categories.json'));

        const results = await Promise.all(
            Object.entries(categories).map(([key, value]) => this._saveToDb(key, value))
        )

        for (const result of results) {
            if (result != null) {
                console.log(result);
            }
        }

        await db.close();
        console.log('closing');
    }

    async _saveToDb( key: string, value: CodeValue) {
        const result = await this.dbActions.search({ key });

        const [cat] = result.res;

        if (cat && cat.key) return;

        return this.dbActions.create({
            date: new Date(),
            key,
            code: value.code,
            full: value.full
        });
    }

    async pullCategories() {
        const db = new DB();
        await db.connect();

        const savedCats = await this.dbActions.getAll();

        const data = savedCats.res.reduce((obj: any, c: any) => {
            obj[c.key] = {
                full: c.full,
                code: c.code
            };

            return obj;
        }, {})

        fs.writeJsonSync(path.join(process.cwd(), 'categories.json'), data, { spaces: 4 });
        await db.close();
        console.log('closing');
    }

    async readCategories() {
        const incoming = path.join(process.cwd(), 'categories.txt');
    
        const cats = path.join(process.cwd(), 'cats.txt');
    
        const data = fs.readJSONSync(incoming);
    
        const codes = fs.readFileSync(cats, 'utf8');
    
        const codeObj = this.prepCats(codes);
    
        for (const d of data) {
            const norm = this.prepFullCat(d);
    
            const code = codeObj[norm];
    
            if (code == null) console.log(code);
        }
    
        fs.writeJSONSync(path.join(process.cwd(), 'crypto_cats.json'), codeObj, { spaces: 4 });
    }
    
    prepCats(file: any) {
        return file.split('\n').filter((line: any) => line != null && line.length > 0)
            .reduce((codes: any, line: string) => {
                const [code, full] = line.split('\t');
    
                const normalized = this.prepFullCat(full);
    
                codes[normalized] = {
                    full,
                    code
                };
    
                return codes
            }, {});
    }
    
    prepFullCat(catName: string): string {
        return catName.replace(/\s|\W/g, '');
    }

}

export = SaveCryptoCategories;

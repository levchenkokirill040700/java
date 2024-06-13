import { Document } from 'mongoose';

class BotDetector {
    bad_paths: string[]
    platform_fields: string[];

    constructor() {
        this.bad_paths = [
            'txt',
            'php',
            'aspx',
            'admin',
            'xml',
            'api',
            'jsp',
            'exp',
            'print.css',
            'htm',
            'version.js',
            'sql',
            'exe',
            'ncdh',
            'env',
            'mifs',
            'console',
            'git'
        ];  
        
        this.platform_fields = [
            'os',
            'browser',
            'platform',
            'version'
        ];
    }

    isBot(visit: Document): boolean {
        if (this._noPlatform(visit)) return true;

        if (this._badPath(visit.get('path'))) return true;

        return false;
    }

    private _noPlatform(visit: Document): boolean {
        return this.platform_fields.some((field) => this._isUndefined(visit.get(field)));
    }

    private _isUndefined(value: any): boolean {
        return value == null || value === 'unknown' || value === 'undefined';
    }

    private _badPath(value: string): boolean {
        return this.bad_paths.some((path) => value.includes(path));
    }

}

export = BotDetector;

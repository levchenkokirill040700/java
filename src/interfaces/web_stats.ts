export interface VisitDetails {
    timestamp: Date | string;
    ip_address?: string;
    base_url?: string;
    hostname?: string;
    path?: string;
    browser?: string;
    version?: string;
    os?: string;
    platform?: string;
    source?: string;
    electron_version?: string;
    details?: string[];
}

export interface StatsData {
    error: boolean;
    uniqueVisits: number;
    totalVisits: number;
    uniqueVisitsOverTime: { [prop: string]: number; };
    totalVisitsOverTime: { [prop: string]: number; };
    tallyByPage: [string, number][];
    tallyByOs: [string, number][];
    tallyByBrowser: [string, number][];
    tallyByIp: [string, [string, number]][];
    tallyByCountry: [string, number][];
}

export interface IPData {
    updated: Date;
    ip_address: string;
    version: string;
    region: string;
    region_code: string;
    city: string;
    country_name: string;
    country_code: string;
    continent_code: string;
    latitude: Number;
    longitude: Number;
    asn: string;
    org: string;
}
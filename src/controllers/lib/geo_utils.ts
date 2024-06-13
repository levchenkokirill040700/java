export function truncateCoordinates(coords: number[], decimals: number): number[] {
    return coords.map((n) => truncateNum(n, decimals));
}

function truncateNum(num: number, decimals: number) {
    const start = `${num}`.indexOf('.');

    if (start === -1) return num;

    return Number.parseFloat(`${num}`.slice(0, start + decimals + 1));
}

export function toLonLat([lon, lat]: number[]): { lat: number, lon: number} {
    return {
        lon,
        lat
    }
}

export function validLat(lat: number): boolean {
    const value = Number.parseFloat(`${lat}`);

    return value >= -90 && value <= 90;
}

export function validLon(lon: number): boolean {
    const value = Number.parseFloat(`${lon}`);

    return value >= -180 && value <= 180;
}
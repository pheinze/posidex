import { Decimal } from 'decimal.js';

// Define a type for the kline data object for clarity
export interface Kline {
    high: Decimal;
    low: Decimal;
    close: Decimal;
}

export const apiService = {
    async fetchBinancePrice(symbol: string): Promise<Decimal> {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Symbol nicht gefunden oder API-Fehler (${response.status})`);
        const data = await response.json();
        return new Decimal(data.price);
    },

    async fetchKlines(symbol: string, interval: string, limit: number = 15): Promise<Kline[]> {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!response.ok) throw new Error(`Kerzendaten konnten nicht geladen werden (${response.status})`);
        const data: [number, string, string, string, string, ...unknown[]][] = await response.json();

        // Map the raw array data to a more usable object format
        return data.map(kline => ({
            high: new Decimal(kline[2]),
            low: new Decimal(kline[3]),
            close: new Decimal(kline[4]),
        }));
    }
};
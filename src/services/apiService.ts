import { Decimal } from 'decimal.js';

/**
 * Represents a single candlestick data point.
 */
export interface Kline {
    /** The highest price during the candlestick period. */
    high: Decimal;
    /** The lowest price during the candlestick period. */
    low: Decimal;
    /** The closing price at the end of the candlestick period. */
    close: Decimal;
}

/**
 * A service for interacting with external APIs, specifically the Binance API.
 */
export const apiService = {
    /**
     * Fetches the latest price for a given trading symbol from the Binance API.
     * @param symbol - The trading symbol (e.g., 'BTCUSDT').
     * @returns A Promise that resolves to the price as a Decimal.
     * @throws Will throw an error if the symbol is not found or if there is an API error.
     */
    async fetchBinancePrice(symbol: string): Promise<Decimal> {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Symbol not found or API error (${response.status})`);
        const data = await response.json();
        return new Decimal(data.price);
    },

    /**
     * Fetches historical kline (candlestick) data for a given symbol and interval.
     * @param symbol - The trading symbol (e.g., 'BTCUSDT').
     * @param interval - The candlestick interval (e.g., '1d', '4h').
     * @param limit - The number of klines to retrieve (default is 15).
     * @returns A Promise that resolves to an array of Kline objects.
     * @throws Will throw an error if the kline data cannot be fetched.
     */
    async fetchKlines(symbol: string, interval: string, limit: number = 15): Promise<Kline[]> {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!response.ok) throw new Error(`Could not load kline data (${response.status})`);
        const data: [number, string, string, string, string, ...unknown[]][] = await response.json();

        // Map the raw array data to a more usable object format
        return data.map(kline => ({
            high: new Decimal(kline[2]),
            low: new Decimal(kline[3]),
            close: new Decimal(kline[4]),
        }));
    }
};
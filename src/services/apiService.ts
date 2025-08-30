import { Decimal } from 'decimal.js';

export const apiService = {
    async fetchBinancePrice(symbol: string): Promise<Decimal> {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Symbol nicht gefunden oder API-Fehler (${response.status})`);
        const data = await response.json();
        return new Decimal(data.price);
    }
};
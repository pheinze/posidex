export interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    trend?: 'any' | 'downtrend' | 'uptrend' | 'uptrend_peak';
}

export interface KeyFeature {
    type: string;
    candleIndex?: number;
    candleIndex1?: number;
    candleIndex2?: number;
    color?: string;
    borderColor?: string;
    gapType?: string;
    direction?: string;
    shadowType?: 'lower' | 'upper';
    yValue1Property?: 'open' | 'high' | 'low' | 'close';
    yValue2Property?: 'open' | 'high' | 'low' | 'close';
    lineWidth?: number;
    dashed?: boolean;
    radius?: number;
}

export interface CandlestickPattern {
    id: string;
    name: string;
    description: string;
    interpretation: string;
    type: string;
    candles: Candle[];
    keyFeatures?: KeyFeature[];
    indicatorCombination: string;
}

const defaultPatternInfoExtension = {
    indicatorCombination: "Information on combining with indicators will follow.",
};

const INTERNAL_ALL_PATTERNS: (Omit<CandlestickPattern, 'indicatorCombination'> & {indicatorCombination?: string})[] = [
            // Indecision
            {
                id: 'doji',
                name: 'Doji',
                description: 'A Doji forms when the opening and closing prices are almost identical (or identical). The body is a thin line. It signals indecision in the market.',
                interpretation: 'Depending on the context, a Doji can signal a trend reversal or continuation. Often a sign of indecision before a significant market move.',
                type: 'Indecision',
                candles: [{ open: 50, high: 60, low: 40, close: 50.5, trend: 'any' }],
                keyFeatures: [ { type: 'body', candleIndex: 0, color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' } ],
                indicatorCombination: "A Doji at a key support line, along with a bullish divergence in the RSI, can be a strong reversal signal. Volume can confirm its significance: high volume on a Doji after a strong trend can signal exhaustion."
            },
            {
                id: 'spinning_top',
                name: 'Spinning Top',
                description: 'A Spinning Top has a small body centered between long upper and lower shadows. The color of the body is not very important. It resembles a Doji but with a discernible (though small) body.',
                interpretation: 'Signals indecision in the market. Neither buyers nor sellers could gain the upper hand. May indicate a potential trend change or a continuation of consolidation, depending on the context.',
                type: 'Indecision',
                candles: [{ open: 50, high: 65, low: 35, close: 52, trend: 'any' }],
                keyFeatures: [ { type: 'body', candleIndex: 0, color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' } ],
                indicatorCombination: "Spinning Tops in overbought/oversold zones (Stochastics, RSI) can indicate an impending correction or reversal. Look for the volume of the next candle for confirmation."
            },
            // Bullish Reversal
            {
                id: 'abandoned_baby_bullish',
                name: 'Abandoned Baby (Bullish)',
                description: 'A very rare but strong bullish reversal pattern. 1. A long bearish candle. 2. A Doji that gaps down below the low of the first candle, with its shadows not overlapping the shadow of the first candle. 3. A long bullish candle that gaps up above the high of the Doji, with its shadows not overlapping the shadow of the Doji.',
                interpretation: 'The gaps on both sides of the Doji completely isolate it, signaling a dramatic reversal of market sentiment. Sellers are exhausted, and buyers take over with great force.',
                type: 'Bullish Reversal',
                candles: [{ open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' }, { open: 40, high: 42, low: 38, close: 40.5 }, { open: 55, high: 80, low: 53, close: 78 }],
                keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'shadow_to_shadow', direction: 'down', color: 'rgba(163,230,53,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'shadow_to_shadow', direction: 'up', color: 'rgba(163,230,53,0.3)'}
                ],
                indicatorCombination: "Due to its rarity and strength, combining it with other indicators is less critical, but an oversold condition (RSI, Stochastics) before the pattern can reinforce the bullish implication."
            },
            {
                id: 'belt_hold_bullish',
                name: 'Belt Hold (Bullish)',
                description: 'A single bullish candle that appears after a downtrend. It opens at its low (or very close to it) and has a long bullish body with little or no lower shadow. A small upper shadow may be present.',
                interpretation: 'Signals a sudden takeover of control by the buyers. The strength of the pattern depends on the length of the body. It is stronger when it appears after a prolonged downward move.',
                type: 'Bullish Reversal',
                candles: [{ open: 30, high: 55, low: 30, close: 53, trend: 'downtrend' }],
                keyFeatures: [{ type: 'body', candleIndex: 0 }],
                indicatorCombination: "High volume on the Belt Hold candle strengthens the signal. It can occur at key support levels or in conjunction with a bullish divergence of a momentum oscillator."
            },
            {
                id: 'breakaway_bullish',
                name: 'Breakaway (Bullish)',
                description: 'A five-candle bullish reversal pattern that occurs after a downtrend. 1. A long bearish candle. 2. A bearish candle that gaps down. 3. One or two more (usually bearish) candles that continue the downtrend. 4. A long bullish candle that closes the gap between the first and second candles or extends into the body of the first candle.',
                interpretation: 'The initial gap and continuation of the downtrend appear bearish, but the final strong bullish candle signals a sudden and powerful reversal by the buyers, negating the previous bearish momentum.',
                type: 'Bullish Reversal',
                candles: [{ open: 80, high: 82, low: 60, close: 62, trend: 'downtrend' }, { open: 55, high: 57, low: 45, close: 48 }, { open: 47, high: 49, low: 40, close: 42 }, { open: 41, high: 43, low: 35, close: 38 }, { open: 37, high: 70, low: 36, close: 68 }],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'down', color: 'rgba(250,204,21,0.3)' },
                    { type: 'body', candleIndex: 4, color: 'rgba(34,197,94,0.4)' }
                ],
                indicatorCombination: "An increase in volume on the fifth (breakout) candle is a strong confirmation sign. It can also be supported by the breaking of a short-term downtrend line."
            },
            {
                id: 'bullish_engulfing',
                name: 'Bullish Engulfing',
                description: 'A bullish engulfing pattern occurs after a downtrend. It consists of two candles: The first is a bearish candle, followed by a larger bullish candle whose body completely engulfs the body of the previous candle.',
                interpretation: 'Signals that buyers have taken control from sellers and a strong bullish reversal is likely.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 50, high: 52, low: 45, close: 46, trend: 'downtrend' },
                    { open: 44, high: 60, low: 43, close: 58 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(239, 68, 68, 0.3)', borderColor: '#EF4444' },
                    { type: 'body', candleIndex: 1, color: 'rgba(34, 197, 94, 0.3)', borderColor: '#22C55E' },
                    { type: 'engulf', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' }
                ],
                 indicatorCombination: "A Bullish Engulfing is stronger when it occurs on high volume. Additional confirmation from an oversold RSI (<30) or a bullish divergence can increase its reliability."
            },
            {
                id: 'bullish_harami',
                name: 'Bullish Harami',
                description: 'A Bullish Harami occurs after a downtrend. It consists of a long bearish candle followed by a small bullish candle whose body is completely contained within the body of the previous candle.',
                interpretation: 'Signals a potential weakening of the downtrend and an impending bullish reversal. Confirmation from the next candle is important.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 40, close: 42, trend: 'downtrend' },
                    { open: 45, high: 50, low: 43, close: 48 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.4)'}
                ],
                indicatorCombination: "A Bullish Harami in an oversold zone (RSI, Stochastics) or at a key support level gains significance. Look for the volume of the confirmation candle."
            },
            {
                id: 'bullish_harami_cross',
                name: 'Bullish Harami Cross',
                description: 'Similar to the Bullish Harami, but the second candle is a Doji. Occurs after a downtrend. A long bearish candle followed by a Doji that is completely contained within the body of the previous candle.',
                interpretation: 'A stronger signal for a bullish reversal than a normal Bullish Harami, as the Doji indicates greater indecision among sellers.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 40, close: 42, trend: 'downtrend' },
                    { open: 48, high: 52, low: 46, close: 48.5 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.4)'}
                ],
                indicatorCombination: "Similar to the Bullish Harami, but the Doji component often makes the signal stronger, especially when accompanied by volume on the confirmation candle."
            },
            {
                id: 'bullish_kicker',
                name: 'Bullish Kicker',
                description: 'An extremely strong bullish reversal pattern. 1. A bearish candle (often long). 2. A bullish candle that gaps up above the high of the previous candle and closes strongly bullish. There is no overlap in the trading ranges.',
                interpretation: 'Signals a sudden and dramatic shift in market sentiment from bearish to bullish. Often triggered by unexpected news. One of the strongest reversal signals.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 45, close: 48, trend: 'downtrend' },
                    { open: 65, high: 85, low: 64, close: 82 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'shadow_to_shadow', direction: 'up', color: 'rgba(163,230,53,0.3)'}
                ],
                indicatorCombination: "Very high volume on the second (kicker) candle confirms the strength of the signal. Due to its sudden nature, combination with prior indicator signals is less typical, but subsequent indicators should confirm the new direction."
            },
            {
                id: 'concealing_baby_swallow',
                name: 'Concealing Baby Swallow',
                description: 'A very rare and complex four-candle bullish reversal pattern that occurs after a strong downtrend. 1. A long bearish Marubozu. 2. Another bearish Marubozu that opens within the body of the first (Gap Down). 3. A bearish candle that opens within the body of the second but closes higher and has an upper shadow that protrudes into the body of the second candle. 4. A long bearish candle that completely engulfs the entire previous candle (the third) (Gap Up and closes lower).',
                interpretation: 'Despite the predominantly bearish candles, this pattern signals extreme seller exhaustion. The inability to make new lows and the complex interactions suggest an impending sharp reversal. Caution is advised due to its rarity and complexity.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 80, high: 80, low: 50, close: 50, trend: 'downtrend' },
                    { open: 48, high: 48, low: 30, close: 30 },
                    { open: 35, high: 45, low: 32, close: 40 },
                    { open: 48, high: 49, low: 20, close: 22 }
                ],
                indicatorCombination: "Due to its rarity, specific indicator combinations are less documented. Confirmation through volume and subsequent bullish price action is crucial."
            },
            {
                id: 'dragonfly_doji',
                name: 'Dragonfly Doji',
                description: 'A Dragonfly Doji forms when the open, high, and close prices are nearly identical, and there is a long lower shadow. There is no or a very small upper shadow. It typically appears after a downtrend.',
                interpretation: 'Signals a potential bullish reversal. Sellers pushed the price down, but buyers took control and brought the price back to the day\'s high. It is stronger when it occurs in a support zone.',
                type: 'Bullish Reversal',
                candles: [{ open: 50, high: 50.5, low: 30, close: 50.2, trend: 'downtrend' }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'shadow', candleIndex: 0, shadowType: 'lower', color: 'rgba(250,204,21,0.4)' }
                ],
                indicatorCombination: "High volume on the Dragonfly Doji can confirm the rejection of lower prices. Its appearance in an oversold zone (RSI) or at a Fibonacci support level increases its significance."
            },
            {
                id: 'hammer',
                name: 'Hammer',
                description: 'A Hammer is a bullish reversal pattern that occurs after a downtrend. It has a small body at the upper end of the trading range and a long lower shadow (at least twice the length of the body). Little to no upper shadow.',
                interpretation: 'Signals that sellers pushed the price down, but buyers were strong enough to bring the price back up to near the opening price. Potential bullish reversal.',
                type: 'Bullish Reversal',
                candles: [{ open: 38, high: 42, low: 20, close: 40, trend: 'downtrend' }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' },
                    { type: 'shadow', candleIndex: 0, shadowType: 'lower', color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' }
                ],
                indicatorCombination: "A Hammer at a key support line or a moving average is a stronger signal. An increase in volume on the Hammer candle or the confirmation candle supports the reversal."
            },
            {
                id: 'homing_pigeon',
                name: 'Homing Pigeon',
                description: 'A two-candle bullish reversal pattern that occurs after a downtrend. 1. A long bearish candle. 2. A smaller bearish candle whose body is completely contained within the body of the first candle. Resembles a bearish harami, but both candles are bearish.',
                interpretation: 'Although both candles are bearish, the fact that the second candle does not close lower and remains within the first suggests diminishing selling momentum and a potential bottoming out. Bullish confirmation is important.',
                type: 'Bullish Reversal',
                candles: [{ open: 60, high: 62, low: 40, close: 42, trend: 'downtrend' }, { open: 50, high: 52, low: 44, close: 46 }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.4)'}
                ],
                indicatorCombination: "A bullish divergence on an oscillator (e.g., RSI, MACD) can reinforce the Homing Pigeon signal. Look for a confirmation candle with higher volume."
            },
            {
                id: 'inverted_hammer',
                name: 'Inverted Hammer',
                description: 'The Inverted Hammer is a bullish reversal pattern that occurs after a downtrend. It has a small body at the lower end of the trading range and a long upper shadow. Little to no lower shadow.',
                interpretation: 'Signals that buyers attempted to push the price up but met resistance. If the next candle closes higher, it can confirm a bullish reversal.',
                type: 'Bullish Reversal',
                candles: [{ open: 40, high: 60, low: 38, close: 42, trend: 'downtrend' }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'shadow', candleIndex: 0, shadowType: 'upper', color: 'rgba(250,204,21,0.4)' }
                ],
                indicatorCombination: "An Inverted Hammer is more significant when it occurs after a clear downtrend and at a support line. Confirmation by a bullish follow-up candle with volume is important."
            },
            {
                id: 'ladder_bottom',
                name: 'Ladder Bottom',
                description: 'A five-candle bullish reversal pattern that occurs after a downtrend. 1-3. Three long bearish candles with successively lower lows. 4. A bearish candle with a small body and a long upper shadow. 5. A large bullish candle that opens above the body of the fourth candle and closes significantly higher.',
                interpretation: 'The first three candles show a strong downtrend. The fourth candle signals an initial weakness of the bears. The fifth bullish candle confirms the reversal with strong buying interest.',
                type: 'Bullish Reversal',
                candles: [{ open: 80, high: 81, low: 65, close: 68, trend: 'downtrend' }, { open: 67, high: 68, low: 55, close: 58 }, { open: 57, high: 58, low: 45, close: 48 }, { open: 47, high: 55, low: 44, close: 46 }, { open: 50, high: 75, low: 49, close: 72 }],
                keyFeatures: [
                    { type: 'body', candleIndex: 3, color: 'rgba(250,204,21,0.3)' },
                    { type: 'body', candleIndex: 4, color: 'rgba(34,197,94,0.4)' }
                ],
                indicatorCombination: "An increase in volume on the fifth (breakout) candle is a strong confirmation sign. It can also be supported by the breaking of a short-term downtrend line."
            },
            {
                id: 'matching_low',
                name: 'Matching Low',
                description: 'A bullish reversal pattern that occurs after a downtrend. 1. A long bearish candle. 2. Another bearish candle that opens below the first but closes at the same level as the first candle (identical closing prices). Both candles often have little to no lower shadows.',
                interpretation: 'The inability of sellers to push the price below the closing price of the first day on the second day suggests waning selling momentum and potential support. Bullish confirmation is advisable.',
                type: 'Bullish Reversal',
                candles: [{ open: 60, high: 62, low: 40, close: 40, trend: 'downtrend' }, { open: 45, high: 47, low: 38, close: 40 }],
                keyFeatures: [
                    { type: 'line', yValue1Property: 'close', candleIndex1: 0, yValue2Property: 'close', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "Its appearance at a known support line or in an oversold zone (RSI) can increase the significance of the Matching Low. A confirmation candle with volume is important."
            },
            {
                id: 'morning_doji_star',
                name: 'Morning Doji Star',
                description: 'A more specific version of the Morning Star. 1. A long bearish candle. 2. A Doji that gaps down below the body of the first candle. 3. A long bullish candle that closes well into the body of the first candle or above it.',
                interpretation: 'The Doji after a gap down signals strong indecision and potential seller exhaustion. The following strong bullish candle confirms the reversal. It is considered a stronger signal than a regular Morning Star.',
                type: 'Bullish Reversal',
                candles: [ { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' }, { open: 42, high: 45, low: 39, close: 42.5 }, { open: 55, high: 80, low: 53, close: 78 } ],
                 keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'down', color: 'rgba(163,230,53,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'up', color: 'rgba(163,230,53,0.3)'}
                ],
                indicatorCombination: "Volume should be low on the Doji. A significant increase in volume on the third (bullish) candle is a strong confirmation feature. An oversold condition (RSI) before the pattern increases its significance."
            },
            {
                id: 'morning_star',
                name: 'Morning Star',
                description: 'The Morning Star is a three-candle bullish reversal pattern that occurs after a downtrend. 1. Long bearish candle. 2. Small candle (Doji, Spinning Top, or small body) that ideally opens below the first candle (Gap Down). 3. Long bullish candle that closes well into the body of the first candle or above it.',
                interpretation: 'Signals waning selling momentum (candle 1), indecision (candle 2), and then a strong takeover by buyers (candle 3), indicating a bullish reversal.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' },
                    { open: 45, high: 48, low: 42, close: 46 },
                    { open: 55, high: 80, low: 53, close: 78 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)', borderColor: '#FACC15' },
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'down', color: 'rgba(163,230,53,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'up', color: 'rgba(163,230,53,0.3)'}
                ],
                indicatorCombination: "Volume on the second ('star') candle is often low. An increase in volume on the third (bullish) candle is a positive sign and increases reliability. Can be confirmed by oversold oscillators (RSI, Stochastics)."
            },
            {
                id: 'piercing_line',
                name: 'Piercing Line',
                description: 'A Piercing Line is a two-candle bullish reversal pattern that occurs after a downtrend. The first candle is long and bearish. The second candle opens below the low of the first candle (Gap Down) but closes above the midpoint of the first candle\'s body.',
                interpretation: 'Signals that buyers are coming back strong after an initial bearish momentum, pushing the price up. A bullish reversal is likely.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 40, close: 42, trend: 'downtrend' },
                    { open: 38, high: 55, low: 37, close: 53 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'low_to_open', direction: 'down', color: 'rgba(250,204,21,0.3)' },
                    { type: 'penetration', candleIndex1: 0, candleIndex2: 1, color: 'rgba(34,197,94,0.3)' }
                ],
                indicatorCombination: "An increase in volume on the second (bullish) candle reinforces the signal. The pattern is stronger when it occurs at a support line or in an oversold zone (RSI)."
            },
            {
                id: 'stick_sandwich',
                name: 'Stick Sandwich',
                description: 'A rare bullish reversal pattern. 1. A long bearish candle. 2. A bullish candle that opens and closes above the close of the first candle. 3. A bearish candle whose closing price is at the same level as the closing price of the first bearish candle. The lows of the two bearish candles form a support.',
                interpretation: 'The middle bullish candle shows buying interest. The third candle tests the support formed by the first candle. If this support holds, a bullish reversal may follow.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 40, close: 42, trend: 'downtrend' },
                    { open: 45, high: 58, low: 44, close: 55 },
                    { open: 53, high: 55, low: 41, close: 42.5 }
                ],
                keyFeatures: [
                    { type: 'line', yValue1Property: 'close', candleIndex1: 0, yValue2Property: 'close', candleIndex2: 2, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "Its appearance at a key support line or a moving average increases its significance. Volume confirmation on the middle bullish candle or the subsequent confirmation candle is positive."
            },
            {
                id: 'three_inside_up',
                name: 'Three Inside Up',
                description: 'A three-candle bullish reversal pattern that occurs after a downtrend. 1. A long bearish candle. 2. A small bullish candle (Harami) whose body is completely contained within the body of the first candle. 3. A bullish candle that closes above the close of the second candle and ideally above the high of the second candle.',
                interpretation: 'Confirms the Bullish Harami pattern and signals a stronger probability of a bullish reversal. The third candle shows that the buyers have taken control.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' },
                    { open: 55, high: 60, low: 53, close: 58 },
                    { open: 59, high: 75, low: 58, close: 73 }
                ],
                keyFeatures: [
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.4)' }
                ],
                indicatorCombination: "An increase in volume on the third candle strengthens the signal. The pattern is more reliable when it occurs in an oversold zone (RSI) or at a support level."
            },
            {
                id: 'three_outside_up',
                name: 'Three Outside Up',
                description: 'A three-candle bullish reversal pattern. 1. A bearish candle. 2. A bullish candle that completely engulfs the first candle (Bullish Engulfing). 3. Another bullish candle that closes above the close of the second candle.',
                interpretation: 'A strong bullish reversal signal that confirms the Bullish Engulfing and suggests a continuation of the upward movement.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 60, high: 62, low: 50, close: 52, trend: 'downtrend' },
                    { open: 50, high: 68, low: 48, close: 65 },
                    { open: 66, high: 75, low: 64, close: 72 }
                ],
                keyFeatures: [
                    { type: 'engulf', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.4)' }
                ],
                indicatorCombination: "Increasing volume on the second and third candles increases reliability. Its appearance after an oversold phase (RSI) or at a support line reinforces the signal."
            },
            {
                id: 'three_white_soldiers',
                name: 'Three White Soldiers',
                description: 'Three White Soldiers is a bullish reversal pattern that occurs after a downtrend. It consists of three consecutive long bullish candles. Each candle opens within the body of the previous candle and closes higher than the previous candle, ideally near its high.',
                interpretation: 'Signals a strong and steady reversal of buying power and the beginning of a new uptrend.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 30, high: 45, low: 28, close: 43, trend: 'downtrend' },
                    { open: 42, high: 58, low: 40, close: 55 },
                    { open: 54, high: 70, low: 52, close: 68 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34,197,94,0.3)' },
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)' },
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.3)' }
                ],
                indicatorCombination: "Ideally, volume should increase with each of the three 'soldier' candles, or at least remain consistently high. The pattern is stronger when it occurs after a significant downtrend or consolidation phase and not in an already heavily overbought zone."
            },
            {
                id: 'tower_bottom',
                name: 'Tower Bottom',
                description: 'A bullish reversal pattern that occurs after a downtrend. It begins with one or more long bearish candles, followed by a phase of consolidation with small bodies (trading in a tight range). The pattern is completed by one or more long bullish candles that break out to the upside.',
                interpretation: 'The long bearish candles show selling pressure. The consolidation phase suggests indecision and a potential bottom formation. The final bullish candles signal a takeover by buyers and a likely trend reversal.',
                type: 'Bullish Reversal',
                candles: [ { open: 70, high: 72, low: 55, close: 58, trend: 'downtrend' }, { open: 57, high: 59, low: 48, close: 50 }, { open: 50, high: 53, low: 47, close: 49 }, { open: 49, high: 52, low: 46, close: 48 }, { open: 48, high: 51, low: 47, close: 50 }, { open: 52, high: 65, low: 50, close: 63 }, { open: 64, high: 78, low: 62, close: 75 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(239,68,68,0.3)'},
                    { type: 'body', candleIndex: 6, color: 'rgba(34,197,94,0.3)'}
                ],
                indicatorCombination: "Volume is often low during the consolidation phase. A significant increase in volume on the breakout bullish candles is a strong confirmation feature. A bullish divergence in the RSI during consolidation can reinforce the signal."
            },
            {
                id: 'tri_star_bullish',
                name: 'Tri-Star (Bullish)',
                description: 'A rare reversal pattern consisting of three Dojis. After a downtrend, the middle Doji forms with a gap lower than the two outer Dojis. All three Dojis have small trading ranges.',
                interpretation: 'The three Dojis signal extreme indecision. The gap down of the middle Doji, followed by an inability to fall further, suggests seller exhaustion and a potential strong bullish reversal.',
                type: 'Bullish Reversal',
                candles: [ { open: 55, high: 58, low: 52, close: 55.5, trend: 'downtrend' }, { open: 48, high: 51, low: 45, close: 48.5 }, { open: 54, high: 57, low: 51, close: 54.5 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'down', color: 'rgba(163,230,53,0.2)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'up', color: 'rgba(163,230,53,0.2)'}
                ],
                indicatorCombination: "Volume is typically low on all three Dojis. An increase on a bullish confirmation candle is crucial. An oversold condition before the pattern increases the probability of a reversal."
            },
            {
                id: 'tweezer_bottoms',
                name: 'Tweezer Bottoms',
                description: 'Tweezer Bottoms are a bullish reversal pattern that typically occurs at the end of a downtrend. It consists of two or more candles with nearly identical lows. The first candle is often bearish, the second bullish, but the forms can vary.',
                interpretation: 'The identical lows suggest a strong support zone. Sellers were unable to push the price further down, indicating a potential bullish reversal.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 50, high: 52, low: 30, close: 35, trend: 'downtrend' },
                    { open: 33, high: 48, low: 30.5, close: 45 }
                ],
                 keyFeatures: [
                    { type: 'low_point', candleIndex: 0, color: 'rgba(250, 204, 21, 0.6)', radius: 5 },
                    { type: 'low_point', candleIndex: 1, color: 'rgba(250, 204, 21, 0.6)', radius: 5 },
                    { type: 'line', yValue1Property: 'low', candleIndex1: 0, yValue2Property: 'low', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "A Tweezer Bottom at a key support line or a Fibonacci retracement level is more significant. A bullish divergence in the RSI or MACD can reinforce the reversal signal."
            },
            {
                id: 'unique_three_river_bottom',
                name: 'Unique Three River Bottom',
                description: 'A rare three-candle bullish reversal pattern. 1. A long bearish candle. 2. A bearish candle with a lower low than the first candle (a kind of Hammer shape, but bearish). 3. A small bullish candle that opens below the close of the second candle and closes above its low, but below its high.',
                interpretation: 'Despite the bearish nature of the first two candles, the inability of sellers to push the price below the low of the second candle and the appearance of the small bullish candle suggest potential seller exhaustion and an impending reversal.',
                type: 'Bullish Reversal',
                candles: [
                    { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' },
                    { open: 55, high: 57, low: 45, close: 48 },
                    { open: 46, high: 50, low: 44, close: 49 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(239,68,68,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.3)'}
                ],
                indicatorCombination: "Due to its rarity, confirmation through increased volume on the third candle or a subsequent bullish candle is particularly important. Oversold oscillators can support the signal."
            },
            // Bullish Continuation
            {
                id: 'mat_hold',
                name: 'Mat Hold',
                description: 'A bullish continuation pattern, similar to the Rising Three Methods but often considered stronger. 1. A long bullish candle. 2. Followed by a small consolidation phase of three small candles (mostly bearish), which gap up from the first candle and remain above its low. 3. Another long bullish candle that gaps up and reaches new highs.',
                interpretation: 'The consolidation above the first bullish candle and the subsequent gap up with another strong bullish candle confirm the continuation of the uptrend with great force.',
                type: 'Bullish Continuation',
                candles: [ { open: 30, high: 60, low: 28, close: 58, trend: 'uptrend' }, { open: 62, high: 65, low: 59, close: 60 }, { open: 60, high: 63, low: 57, close: 58 }, { open: 58, high: 61, low: 56, close: 59 }, { open: 68, high: 90, low: 67, close: 88 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34,197,94,0.3)' },
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'up', color: 'rgba(163,230,53,0.2)' },
                    { type: 'gap', candleIndex1: 3, candleIndex2: 4, direction: 'up', color: 'rgba(163,230,53,0.2)' },
                    { type: 'body', candleIndex: 4, color: 'rgba(34,197,94,0.4)' }
                ],
                indicatorCombination: "Volume should be high on the first and fifth (strong bullish) candles. During the consolidation phase (candles 2-4), lower volume is typical. Holding above a key moving average supports the continuation."
            },
            {
                id: 'rising_three_methods',
                name: 'Rising Three Methods',
                description: 'A bullish continuation pattern. It begins with a long bullish candle, followed by three (or more) small bearish candles that remain within the range of the first candle. The pattern ends with another long bullish candle that closes above the close of the first long bullish candle.',
                interpretation: 'Indicates a pause or consolidation within an uptrend before the trend resumes. The small bearish candles represent temporary profit-taking, but the bulls regain control.',
                type: 'Bullish Continuation',
                candles: [
                    { open: 30, high: 60, low: 28, close: 58, trend: 'uptrend' },
                    { open: 55, high: 57, low: 50, close: 52 },
                    { open: 50, high: 53, low: 47, close: 48 },
                    { open: 47, high: 49, low: 44, close: 46 },
                    { open: 45, high: 75, low: 43, close: 70 }
                ],
                keyFeatures: [
                    { type: 'body_range', candleIndex: 0, color: 'rgba(250,204,21,0.2)'},
                    { type: 'body', candleIndex: 4, color: 'rgba(34,197,94,0.4)'}
                ],
                indicatorCombination: "Volume should be relatively high on the first and last (long bullish) candles. During the consolidation phase (small bearish candles), lower volume is typical and confirms the pause. A MACD that remains bullish or shows a bullish crossover during consolidation can reinforce the signal."
            },
            {
                id: 'separating_lines_bullish',
                name: 'Separating Lines (Bullish)',
                description: 'A bullish continuation pattern. 1. In an uptrend, a long bearish candle appears. 2. The next day, the market gaps up to the same opening price as the previous bearish candle and closes as a long bullish candle.',
                interpretation: 'The bearish candle seems to suggest a reversal, but the gap up to the previous opening price and the strong bullish movement on the second day negate the bearish implication and signal a continuation of the uptrend.',
                type: 'Bullish Continuation',
                candles: [{ open: 60, high: 62, low: 40, close: 42, trend: 'uptrend' }, { open: 60, high: 80, low: 58, close: 78 }],
                keyFeatures: [
                    { type: 'line', yValue1Property: 'open', candleIndex1: 0, yValue2Property: 'open', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "An increase in volume on the second (bullish) candle can underscore the strength of the trend continuation. The pattern is stronger when it occurs above a key moving average."
            },
            {
                id: 'side_by_side_white_lines_bullish',
                name: 'Side-by-Side White Lines (Bullish)',
                description: 'A bullish continuation pattern. 1. In an uptrend, a bullish candle forms. 2. The next day, another bullish candle gaps up and closes at about the same level as the first bullish candle. Both candles have similar sizes and opening prices (after the gap).',
                interpretation: 'The gap up and the inability of bears to push the price down confirm the strength of the uptrend. A continuation of the bullish movement is expected.',
                type: 'Bullish Continuation',
                candles: [ { open: 30, high: 50, low: 28, close: 48, trend: 'uptrend' }, { open: 55, high: 65, low: 53, close: 63 }, { open: 56, high: 66, low: 54, close: 64 } ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'up', color: 'rgba(163,230,53,0.3)'},
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.3)'}
                ],
                indicatorCombination: "Volume should at least remain stable or increase on the gaps and bullish candles to confirm strength. A MACD remaining in the bullish zone supports the signal."
            },
            {
                id: 'upside_gap_three_methods',
                name: 'Upside Gap Three Methods',
                description: 'A bullish continuation pattern. 1. A long bullish candle. 2. Another long bullish candle that gaps up. 3. A small bearish candle that fills the gap between the first two candles but does not fall below the close of the first candle.',
                interpretation: 'The initial gap shows strong bullish momentum. The bearish candle represents profit-taking or a test of the gap. As long as the gap is not fully closed and the price remains above the close of the first candle, a continuation of the uptrend is expected.',
                type: 'Bullish Continuation',
                candles: [ { open: 30, high: 50, low: 28, close: 48, trend: 'uptrend' }, { open: 55, high: 75, low: 53, close: 73 }, { open: 70, high: 72, low: 50, close: 52 } ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'up', color: 'rgba(163,230,53,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'}
                ],
                indicatorCombination: "Volume should be high on the first two bullish candles (especially the gapping candle). Lower volume is desirable on the third (corrective bearish) candle. A renewed increase on the trend continuation is positive."
            },
            {
                id: 'upside_tasuki_gap',
                name: 'Upside Tasuki Gap',
                description: 'A bullish continuation pattern. 1. A long bullish candle. 2. Another bullish candle that gaps up. 3. A bearish candle that opens within and closes inside the gap, but does not fully close the gap.',
                interpretation: 'The gap represents strong bullish momentum. The third candle is an attempt by the bears to close the gap but fails. This confirms bullish strength and suggests a continuation of the uptrend.',
                type: 'Bullish Continuation',
                candles: [
                    { open: 30, high: 50, low: 28, close: 48, trend: 'uptrend' },
                    { open: 55, high: 65, low: 53, close: 63 },
                    { open: 60, high: 61, low: 52, close: 54 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'up', color: 'rgba(163,230,53,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'}
                ],
                indicatorCombination: "Volume should increase on the second candle (gap up). Lower volume on the third (bearish) candle is typical. A renewed volume increase on the trend continuation is positive."
            },
            // Bullish Strength/Continuation
            {
                id: 'bullish_marubozu',
                name: 'Bullish Marubozu',
                description: 'A Bullish Marubozu is a long green (or white) candle with no upper or lower shadows. The opening price is the same as the low price, and the closing price is the same as the high price.',
                interpretation: 'Shows extreme bullish strength. The buyers controlled the price from the open to the close. Can signal the beginning of a bullish trend or the continuation of an uptrend.',
                type: 'Bullish Strength/Continuation',
                candles: [{ open: 40, high: 70, low: 40, close: 70, trend: 'any' }],
                keyFeatures: [{ type: 'body', candleIndex: 0 }],
                indicatorCombination: "High volume on a Bullish Marubozu confirms the strength and conviction of the buyers and significantly increases the reliability of the signal."
            },
            // Bearish Reversal
            {
                id: 'abandoned_baby_bearish',
                name: 'Abandoned Baby (Bearish)',
                description: 'A very rare but strong bearish reversal pattern. 1. A long bullish candle. 2. A Doji that gaps up above the high of the first candle, with its shadows not overlapping the shadow of the first candle. 3. A long bearish candle that gaps down below the low of the Doji, with its shadows not overlapping the shadow of the Doji.',
                interpretation: 'The gaps on both sides of the Doji completely isolate it, signaling a dramatic reversal of market sentiment. Buyers are exhausted, and sellers take over with great force.',
                type: 'Bearish Reversal',
                candles: [{ open: 30, high: 52, low: 28, close: 50, trend: 'uptrend' }, { open: 60, high: 62, low: 58, close: 60.5 }, { open: 45, high: 47, low: 20, close: 22 }],
                keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'shadow_to_shadow', direction: 'up', color: 'rgba(239,68,68,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'shadow_to_shadow', direction: 'down', color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "An overbought condition (RSI, Stochastics) before the pattern can reinforce the bearish implication. Volume should be low on the Doji and increase significantly on the third, strong bearish candle."
            },
            {
                id: 'advance_block',
                name: 'Advance Block',
                description: 'A bearish reversal pattern of three bullish candles that occurs after an uptrend. Each candle opens within the body of the previous one and closes higher, but the bodies become successively smaller and the upper shadows longer. Similar to Three White Soldiers but with signs of weakness.',
                interpretation: 'Although the price is rising, the shrinking bodies and longer upper shadows indicate waning buying power and increasing selling pressure. A bearish reversal becomes more likely.',
                type: 'Bearish Reversal',
                candles: [{ open: 30, high: 50, low: 28, close: 48, trend: 'uptrend' }, { open: 47, high: 60, low: 46, close: 57 }, { open: 56, high: 65, low: 55, close: 61 }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34,197,94,0.2)'},
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.4)'}
                ],
                indicatorCombination: "Decreasing volume over the three candles can underscore the waning buying power. A bearish divergence on oscillators (RSI, MACD) would reinforce the reversal signal."
            },
            {
                id: 'belt_hold_bearish',
                name: 'Belt Hold (Bearish)',
                description: 'A single bearish candle that appears after an uptrend. It opens at its high (or very close to it) and has a long bearish body with little or no upper shadow. A small lower shadow may be present.',
                interpretation: 'Signals a sudden takeover of control by the sellers. The strength of the pattern depends on the length of the body. It is stronger when it appears after a prolonged upward move.',
                type: 'Bearish Reversal',
                candles: [{ open: 70, high: 70, low: 45, close: 47, trend: 'uptrend' }],
                keyFeatures: [{ type: 'body', candleIndex: 0 }],
                indicatorCombination: "High volume on the Belt Hold candle strengthens the signal. It can occur at key resistance levels or in conjunction with a bearish divergence of a momentum oscillator."
            },
             {
                id: 'breakaway_bearish',
                name: 'Breakaway (Bearish)',
                description: 'A five-candle bearish reversal pattern that occurs after an uptrend. 1. A long bullish candle. 2. A bullish candle that gaps up. 3. One or two more (usually bullish) candles that continue the uptrend. 4. A long bearish candle that closes the gap between the first and second candles or extends into the body of the first candle.',
                interpretation: 'The initial gap and continuation of the uptrend appear bullish, but the final strong bearish candle signals a sudden and powerful reversal by the sellers, negating the previous bullish momentum.',
                type: 'Bearish Reversal',
                candles: [{ open: 30, high: 52, low: 28, close: 50, trend: 'uptrend' }, { open: 57, high: 67, low: 55, close: 65 }, { open: 66, high: 75, low: 64, close: 72 }, { open: 73, high: 80, low: 71, close: 78 }, { open: 79, high: 81, low: 40, close: 45 }],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'up', color: 'rgba(250,204,21,0.3)' },
                    { type: 'body', candleIndex: 4, color: 'rgba(239,68,68,0.4)' }
                ],
                indicatorCombination: "An increase in volume on the fifth (breakout) candle is a strong confirmation sign. It can also be supported by the breaking of a short-term uptrend line."
            },
            {
                id: 'bearish_engulfing',
                name: 'Bearish Engulfing',
                description: 'A bearish engulfing pattern occurs after an uptrend. It consists of two candles: The first is a bullish candle, followed by a larger bearish candle whose body completely engulfs the body of the previous candle.',
                interpretation: 'Signals that sellers have taken control from buyers and a strong bearish reversal is likely.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 50, high: 55, low: 48, close: 54, trend: 'uptrend' },
                    { open: 56, high: 57, low: 40, close: 42 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34, 197, 94, 0.3)', borderColor: '#22C55E' },
                    { type: 'body', candleIndex: 1, color: 'rgba(239, 68, 68, 0.3)', borderColor: '#EF4444' },
                    { type: 'engulf', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250, 204, 21, 0.4)', borderColor: '#FACC15' }
                ],
                indicatorCombination: "A Bearish Engulfing is stronger when it occurs on high volume. Additional confirmation from an overbought RSI (>70) or a bearish divergence can increase its reliability."
            },
            {
                id: 'bearish_harami',
                name: 'Bearish Harami',
                description: 'A Bearish Harami occurs after an uptrend. It consists of a long bullish candle followed by a small bearish candle whose body is completely contained within the body of the previous candle.',
                interpretation: 'Signals a potential weakening of the uptrend and an impending bearish reversal. Confirmation from the next candle is important.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 40, high: 62, low: 38, close: 60, trend: 'uptrend' },
                    { open: 55, high: 57, low: 50, close: 52 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.4)'}
                ],
                indicatorCombination: "A Bearish Harami in an overbought zone (RSI, Stochastics) or at a key resistance line gains significance. Look for the volume of the confirmation candle."
            },
            {
                id: 'bearish_harami_cross',
                name: 'Bearish Harami Cross',
                description: 'Similar to the Bearish Harami, but the second candle is a Doji. Occurs after an uptrend. A long bullish candle followed by a Doji that is completely contained within the body of the previous candle.',
                interpretation: 'A stronger signal for a bearish reversal than a normal Bearish Harami, as the Doji indicates greater indecision among buyers.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 40, high: 62, low: 38, close: 60, trend: 'uptrend' },
                    { open: 55, high: 59, low: 53, close: 55.5 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.4)'}
                ],
                indicatorCombination: "Similar to the Bearish Harami, but the Doji component often makes the signal stronger, especially when accompanied by volume on the confirmation candle."
            },
            {
                id: 'bearish_kicker',
                name: 'Bearish Kicker',
                description: 'An extremely strong bearish reversal pattern. 1. A bullish candle (often long). 2. A bearish candle that gaps down below the low of the previous candle and closes strongly bearish. There is no overlap in the trading ranges.',
                interpretation: 'Signals a sudden and dramatic shift in market sentiment from bullish to bearish. Often triggered by unexpected news. One of the strongest reversal signals.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 40, high: 62, low: 38, close: 60, trend: 'uptrend' },
                    { open: 35, high: 36, low: 18, close: 20 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'shadow_to_shadow', direction: 'down', color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "Very high volume on the second (kicker) candle confirms the strength of the signal. Due to its sudden nature, combination with prior indicator signals is less typical, but subsequent indicators should confirm the new direction."
            },
            {
                id: 'dark_cloud_cover',
                name: 'Dark Cloud Cover',
                description: 'A Dark Cloud Cover is a two-candle bearish reversal pattern that occurs after an uptrend. The first candle is long and bullish. The second candle opens above the high of the first candle (Gap Up) but closes below the midpoint of the first candle\'s body.',
                interpretation: 'Signals that sellers are coming back strong after an initial bullish momentum, pushing the price down. A bearish reversal is likely.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 40, high: 62, low: 38, close: 60, trend: 'uptrend' },
                    { open: 64, high: 65, low: 45, close: 47 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'high_to_open', direction: 'up', color: 'rgba(250,204,21,0.3)' },
                    { type: 'penetration', candleIndex1: 0, candleIndex2: 1, color: 'rgba(239,68,68,0.3)' }
                ],
                indicatorCombination: "An increase in volume on the second (bearish) candle reinforces the signal. The pattern is stronger when it occurs at a resistance line or in an overbought zone (RSI)."
            },
            {
                id: 'deliberation_stalled',
                name: 'Deliberation / Stalled Pattern',
                description: 'A bearish reversal pattern that occurs after an uptrend. It consists of three bullish candles. The first two are long bullish candles. The third bullish candle is small and gaps up or opens near the high of the second candle, but shows an inability to rise further.',
                interpretation: 'Similar to the Advance Block. The waning strength of the third candle despite the gap suggests buyer exhaustion and an impending bearish reversal.',
                type: 'Bearish Reversal',
                candles: [{ open: 30, high: 55, low: 28, close: 53, trend: 'uptrend' }, { open: 54, high: 70, low: 53, close: 68 }, { open: 70, high: 75, low: 69, close: 72 }],
                 keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34,197,94,0.2)'},
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(34,197,94,0.4)'}
                ],
                indicatorCombination: "Decreasing volume over the three candles can signal waning buying power. A bearish divergence on oscillators (RSI, MACD) would reinforce the reversal signal."
            },
            {
                id: 'evening_doji_star',
                name: 'Evening Doji Star',
                description: 'A more specific version of the Evening Star. 1. A long bullish candle. 2. A Doji that gaps up above the body of the first candle. 3. A long bearish candle that closes well into the body of the first candle or below it.',
                interpretation: 'The Doji after a gap up signals strong indecision and potential buyer exhaustion. The following strong bearish candle confirms the reversal. It is considered a stronger signal than a regular Evening Star.',
                type: 'Bearish Reversal',
                candles: [ { open: 30, high: 52, low: 28, close: 50, trend: 'uptrend' }, { open: 58, high: 61, low: 55, close: 58.5 }, { open: 45, high: 47, low: 20, close: 22 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'up', color: 'rgba(239,68,68,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'down', color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "Volume should be low on the Doji. A significant increase in volume on the third (bearish) candle is a strong confirmation feature. An overbought condition (RSI) before the pattern increases its significance."
            },
            {
                id: 'evening_star',
                name: 'Evening Star',
                description: 'The Evening Star is a three-candle bearish reversal pattern that occurs after an uptrend. 1. Long bullish candle. 2. Small candle (Doji, Spinning Top, or small body) that ideally opens above the first candle (Gap Up). 3. Long bearish candle that closes well into the body of the first candle or below it.',
                interpretation: 'Signals waning buying momentum (candle 1), indecision (candle 2), and then a strong takeover by sellers (candle 3), indicating a bearish reversal.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 50, high: 72, low: 48, close: 70, trend: 'uptrend' },
                    { open: 75, high: 78, low: 72, close: 74 },
                    { open: 65, high: 67, low: 40, close: 42 }
                ],
                 keyFeatures: [
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'up', color: 'rgba(239,68,68,0.3)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'down', color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "Volume on the second ('star') candle is often low. An increase in volume on the third (bearish) candle is a positive sign. Can be confirmed by overbought oscillators (RSI, Stochastics)."
            },
            {
                id: 'gravestone_doji',
                name: 'Gravestone Doji',
                description: 'A Gravestone Doji forms when the open, low, and close prices are nearly identical, and there is a long upper shadow. There is no or a very small lower shadow. It typically appears after an uptrend.',
                interpretation: 'Signals a potential bearish reversal. Buyers pushed the price up, but sellers took control and brought the price back to the day\'s low. It is stronger when it occurs in a resistance zone.',
                type: 'Bearish Reversal',
                candles: [{ open: 50, high: 70, low: 49.5, close: 50.2, trend: 'uptrend' }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0 },
                    { type: 'shadow', candleIndex: 0, shadowType: 'upper', color: 'rgba(250,204,21,0.4)' }
                ],
                indicatorCombination: "High volume on the Gravestone Doji can confirm the rejection of higher prices. Its appearance in an overbought zone (RSI) or at a Fibonacci resistance level increases its significance."
            },
            {
                id: 'hanging_man',
                name: 'Hanging Man',
                description: 'The Hanging Man is a bearish reversal pattern that occurs after an uptrend. It has the same shape as a Hammer (small body at the top, long lower shadow) but appears after an uptrend.',
                interpretation: 'Although it looks bullish, its appearance after an uptrend suggests waning buying power and a potential bearish reversal, especially if the next candle closes lower.',
                type: 'Bearish Reversal',
                candles: [{ open: 78, high: 82, low: 60, close: 80, trend: 'uptrend' }],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(250,204,21,0.4)' },
                    { type: 'shadow', candleIndex: 0, shadowType: 'lower', color: 'rgba(250,204,21,0.4)' }
                ],
                indicatorCombination: "A Hanging Man at a key resistance level or a moving average is a stronger signal. An increase in volume on the confirmation candle supports the reversal."
            },
            {
                id: 'shooting_star',
                name: 'Shooting Star',
                description: 'A Shooting Star is a bearish reversal pattern that occurs after an uptrend. It has a small body at the lower end of the trading range and a long upper shadow (at least twice the length of the body). Little to no lower shadow.',
                interpretation: 'Signals that buyers pushed the price up, but sellers were strong enough to bring the price back down to near the opening price. Potential bearish reversal.',
                type: 'Bearish Reversal',
                candles: [{ open: 72, high: 90, low: 68, close: 70, trend: 'uptrend' }],
                 keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(250,204,21,0.4)' },
                    { type: 'shadow', candleIndex: 0, shadowType: 'upper', color: 'rgba(250,204,21,0.4)' }
                ],
                indicatorCombination: "A Shooting Star at a resistance level or in an overbought zone (RSI) is more significant. An increase in volume on the Shooting Star candle or the bearish confirmation candle increases reliability."
            },
            {
                id: 'three_black_crows',
                name: 'Three Black Crows',
                description: 'Three Black Crows is a bearish reversal pattern that occurs after an uptrend. It consists of three consecutive long bearish candles. Each candle opens within the body of the previous candle and closes lower than the previous candle, ideally near its low.',
                interpretation: 'Signals a strong and steady reversal of selling power and the beginning of a new downtrend.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 70, high: 72, low: 55, close: 57, trend: 'uptrend' },
                    { open: 58, high: 60, low: 42, close: 45 },
                    { open: 46, high: 48, low: 30, close: 32 }
                ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(239,68,68,0.3)' },
                    { type: 'body', candleIndex: 1, color: 'rgba(239,68,68,0.3)' },
                    { type: 'body', candleIndex: 2, color: 'rgba(239,68,68,0.3)' }
                ],
                indicatorCombination: "Ideally, volume should increase with each of the three 'crow' candles, or at least remain consistently high. The pattern is stronger when it occurs after a significant uptrend or a consolidation phase at the top and not in an already heavily overbought zone."
            },
            {
                id: 'three_inside_down',
                name: 'Three Inside Down',
                description: 'A three-candle bearish reversal pattern that occurs after an uptrend. 1. A long bullish candle. 2. A small bearish candle (Harami) whose body is completely contained within the body of the first candle. 3. A bearish candle that closes below the close of the second candle and ideally below the low of the second candle.',
                interpretation: 'Confirms the Bearish Harami pattern and signals a stronger probability of a bearish reversal. The third candle shows that the sellers have taken control.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 50, high: 72, low: 48, close: 70, trend: 'uptrend' },
                    { open: 65, high: 67, low: 60, close: 62 },
                    { open: 61, high: 62, low: 45, close: 47 }
                ],
                keyFeatures: [
                    { type: 'body_inside_body', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(239,68,68,0.4)' }
                ],
                indicatorCombination: "An increase in volume on the third candle strengthens the signal. The pattern is more reliable when it occurs in an overbought zone (RSI) or at a resistance level."
            },
            {
                id: 'three_outside_down',
                name: 'Three Outside Down',
                description: 'A three-candle bearish reversal pattern. 1. A bullish candle. 2. A bearish candle that completely engulfs the first candle (Bearish Engulfing). 3. Another bearish candle that closes below the close of the second candle.',
                interpretation: 'A strong bearish reversal signal that confirms the Bearish Engulfing and suggests a continuation of the downward movement.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 40, high: 52, low: 38, close: 50, trend: 'uptrend' },
                    { open: 52, high: 54, low: 35, close: 38 },
                    { open: 37, high: 39, low: 28, close: 30 }
                ],
                keyFeatures: [
                    { type: 'engulf', candleIndex1: 0, candleIndex2: 1, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(239,68,68,0.4)' }
                ],
                indicatorCombination: "Increasing volume on the second and third candles increases reliability. Its appearance after an overbought phase (RSI) or at a resistance line reinforces the signal."
            },
            {
                id: 'tower_top',
                name: 'Tower Top',
                description: 'A bearish reversal pattern that occurs after an uptrend. It begins with one or more long bullish candles, followed by a phase of consolidation with small bodies (trading in a tight range). The pattern is completed by one or more long bearish candles that break out to the downside.',
                interpretation: 'The long bullish candles show buying pressure. The consolidation phase suggests indecision and a potential top formation. The final bearish candles signal a takeover by sellers and a likely trend reversal.',
                type: 'Bearish Reversal',
                candles: [ { open: 30, high: 45, low: 28, close: 42, trend: 'uptrend' }, { open: 43, high: 55, low: 41, close: 52 }, { open: 52, high: 55, low: 49, close: 53 }, { open: 53, high: 56, low: 50, close: 51 }, { open: 51, high: 54, low: 48, close: 50 }, { open: 48, high: 50, low: 35, close: 38 }, { open: 37, high: 39, low: 25, close: 28 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(34,197,94,0.3)'},
                    { type: 'body', candleIndex: 6, color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "Volume is often low during the consolidation phase. A significant increase in volume on the breakout bearish candles is a strong confirmation feature. A bearish divergence in the RSI during consolidation can reinforce the signal."
            },
            {
                id: 'tri_star_bearish',
                name: 'Tri-Star (Bearish)',
                description: 'A rare reversal pattern consisting of three Dojis. After an uptrend, the middle Doji forms with a gap higher than the two outer Dojis. All three Dojis have small trading ranges.',
                interpretation: 'The three Dojis signal extreme indecision. The gap up of the middle Doji, followed by an inability to rise further, suggests buyer exhaustion and a potential strong bearish reversal.',
                type: 'Bearish Reversal',
                candles: [ { open: 45, high: 48, low: 42, close: 45.5, trend: 'uptrend' }, { open: 52, high: 55, low: 49, close: 52.5 }, { open: 46, high: 49, low: 43, close: 46.5 } ],
                keyFeatures: [
                    { type: 'body', candleIndex: 0, color: 'rgba(250,204,21,0.3)'},
                    { type: 'body', candleIndex: 1, color: 'rgba(250,204,21,0.4)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'},
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, gapType: 'body_to_body', direction: 'up', color: 'rgba(239,68,68,0.2)'},
                    { type: 'gap', candleIndex1: 1, candleIndex2: 2, gapType: 'body_to_body', direction: 'down', color: 'rgba(239,68,68,0.2)'}
                ],
                indicatorCombination: "Volume is typically low on all three Dojis. An increase on a bearish confirmation candle is crucial. An overbought condition before the pattern increases the probability of a reversal."
            },
            {
                id: 'tweezer_tops',
                name: 'Tweezer Tops',
                description: 'Tweezer Tops are a bearish reversal pattern that typically occurs at the end of an uptrend. It consists of two or more candles with nearly identical highs. The first candle is often bullish, the second bearish, but the forms can vary.',
                interpretation: 'The identical highs suggest a strong resistance zone. Buyers were unable to push the price further up, indicating a potential bearish reversal.',
                type: 'Bearish Reversal',
                candles: [
                    { open: 50, high: 70, low: 48, close: 65, trend: 'uptrend' },
                    { open: 67, high: 70.5, low: 52, close: 55 }
                ],
                keyFeatures: [
                    { type: 'high_point', candleIndex: 0, color: 'rgba(250, 204, 21, 0.6)', radius: 5 },
                    { type: 'high_point', candleIndex: 1, color: 'rgba(250, 204, 21, 0.6)', radius: 5 },
                    { type: 'line', yValue1Property: 'high', candleIndex1: 0, yValue2Property: 'high', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "A Tweezer Top at a key resistance line or a Fibonacci retracement level is more significant. A bearish divergence in the RSI or MACD can reinforce the reversal signal."
            },
            // Bearish Continuation
            {
                id: 'downside_gap_three_methods',
                name: 'Downside Gap Three Methods',
                description: 'A bearish continuation pattern. 1. A long bearish candle. 2. Another long bearish candle that gaps down. 3. A small bullish candle that fills the gap between the first two candles but does not rise above the close of the first candle.',
                interpretation: 'The initial gap shows strong bearish momentum. The bullish candle represents profit-taking or a test of the gap. As long as the gap is not fully closed and the price remains below the close of the first candle, a continuation of the downtrend is expected.',
                type: 'Bearish Continuation',
                candles: [ { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' }, { open: 45, high: 47, low: 25, close: 27 }, { open: 30, high: 50, low: 28, close: 48 } ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(239,68,68,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'}
                ],
                indicatorCombination: "Volume should be high on the first two bearish candles (especially the gapping candle). Lower volume is desirable on the third (corrective bullish) candle."
            },
            {
                id: 'downside_tasuki_gap',
                name: 'Downside Tasuki Gap',
                description: 'A bearish continuation pattern. 1. A long bearish candle. 2. Another bearish candle that gaps down. 3. A bullish candle that opens within and closes inside the gap, but does not fully close the gap.',
                interpretation: 'The gap represents strong bearish momentum. The third candle is an attempt by the bulls to close the gap but fails. This confirms bearish strength and suggests a continuation of the downtrend.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 70, high: 72, low: 50, close: 52, trend: 'downtrend' },
                    { open: 45, high: 47, low: 35, close: 37 },
                    { open: 40, high: 48, low: 39, close: 46 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(239,68,68,0.3)'},
                    { type: 'body', candleIndex: 2, color: 'rgba(250,204,21,0.3)'}
                ],
                indicatorCombination: "Volume should increase on the second candle (gap down). Lower volume on the third (bullish) candle is typical."
            },
            {
                id: 'falling_three_methods',
                name: 'Falling Three Methods',
                description: 'A bearish continuation pattern. It begins with a long bearish candle, followed by three (or more) small bullish candles that remain within the range of the first candle. The pattern ends with another long bearish candle that closes below the close of the first long bearish candle.',
                interpretation: 'Indicates a pause or consolidation within a downtrend before the trend resumes. The small bullish candles represent a temporary recovery, but the bears regain control.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 70, high: 72, low: 40, close: 42, trend: 'downtrend' },
                    { open: 45, high: 48, low: 43, close: 46 },
                    { open: 48, high: 51, low: 46, close: 49 },
                    { open: 50, high: 53, low: 48, close: 51 },
                    { open: 55, high: 57, low: 25, close: 30 }
                ],
                keyFeatures: [
                    { type: 'body_range', candleIndex: 0, color: 'rgba(250,204,21,0.2)'},
                    { type: 'body', candleIndex: 4, color: 'rgba(239,68,68,0.4)'}
                ],
                indicatorCombination: "Volume should be relatively high on the first and last (long bearish) candles. During the consolidation phase (small bullish candles), lower volume is typical."
            },
            {
                id: 'in_neck_line',
                name: 'In Neck Line',
                description: 'A bearish continuation pattern, similar to the On Neck Line. 1. A long bearish candle. 2. A small bullish candle that opens below the low of the first candle (Gap Down) and closes slightly into the body of the first candle, but below its midpoint.',
                interpretation: 'Similar to On Neck, but the bulls show slightly more strength by closing into the body of the previous candle. Nevertheless, a continuation of the downtrend is usually expected if the closing price of the second candle is not significant.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 60, high: 61, low: 40, close: 42, trend: 'downtrend' },
                    { open: 38, high: 48, low: 37, close: 44 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(250,204,21,0.3)' },
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)'}
                ],
                indicatorCombination: "No strong volume indication, but an increase on the continuation of the downtrend would be confirming. The pattern is stronger when it occurs below a key moving average."
            },
            {
                id: 'on_neck_line',
                name: 'On Neck Line',
                description: 'A bearish continuation pattern that occurs in a downtrend. 1. A long bearish candle. 2. A small bullish candle that opens below the low of the first candle (Gap Down) and closes near the low of the first candle (the closing prices are almost the same).',
                interpretation: 'The bulls attempt a recovery but fail to lift the price significantly above the low of the previous candle. This suggests a continuation of the downtrend.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 60, high: 61, low: 40, close: 42, trend: 'downtrend' },
                    { open: 38, high: 45, low: 37, close: 41.5 }
                ],
                 keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(250,204,21,0.3)' },
                    { type: 'line', yValue1Property: 'close', candleIndex1: 0, yValue2Property: 'close', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "Similar to In Neck Line. A MACD remaining in the bearish zone or showing a bearish crossover can support the signal."
            },
            {
                id: 'separating_lines_bearish',
                name: 'Separating Lines (Bearish)',
                description: 'A bearish continuation pattern. 1. In a downtrend, a long bullish candle appears. 2. The next day, the market gaps down to the same opening price as the previous bullish candle and closes as a long bearish candle.',
                interpretation: 'The bullish candle seems to suggest a reversal, but the gap down to the previous opening price and the strong bearish movement on the second day negate the bullish implication and signal a continuation of the downtrend.',
                type: 'Bearish Continuation',
                candles: [{ open: 40, high: 62, low: 38, close: 60, trend: 'downtrend' }, { open: 40, high: 42, low: 20, close: 22 }],
                keyFeatures: [
                    { type: 'line', yValue1Property: 'open', candleIndex1: 0, yValue2Property: 'open', candleIndex2: 1, color: '#FACC15', lineWidth: 2, dashed: true }
                ],
                indicatorCombination: "An increase in volume on the second (bearish) candle can underscore the strength of the trend continuation. The pattern is stronger when it occurs below a key moving average."
            },
            {
                id: 'thrusting_line',
                name: 'Thrusting Line',
                description: 'A pattern that occurs in a downtrend. 1. A long bearish candle. 2. A bullish candle that opens below the low of the first candle (Gap Down) and closes into the body of the first candle, but does not go past its midpoint.',
                interpretation: 'Often considered a bearish continuation pattern because the bulls lack the strength to push the price above the midpoint of the previous bearish candle. However, if the price rises above the high of the Thrusting Line in the following days, it can be a false signal and indicate a bullish reversal.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 60, high: 61, low: 40, close: 42, trend: 'downtrend' },
                    { open: 38, high: 52, low: 37, close: 49 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(250,204,21,0.3)' },
                    { type: 'body', candleIndex: 1, color: 'rgba(34,197,94,0.3)'}
                ],
                indicatorCombination: "No strong specific volume indication. The pattern is weaker than a Piercing Line and should be treated with caution; confirmation by further bearish candles is important."
            },
            {
                id: 'two_black_gapping_candles',
                name: 'Two Black Gapping Candles',
                description: 'A bearish continuation pattern that occurs after a significant high in an uptrend. 1. A bearish candle that gaps down from the previous (bullish) candle. 2. Another bearish candle that gaps down from the first bearish candle and closes lower.',
                interpretation: 'The consecutive gaps down signal strong bearish momentum and a likely continuation of the downtrend. This pattern is particularly strong when it occurs after a top.',
                type: 'Bearish Continuation',
                candles: [
                    { open: 65, high: 66, low: 50, close: 52, trend: 'uptrend_peak' },
                    { open: 48, high: 49, low: 35, close: 38 }
                ],
                keyFeatures: [
                    { type: 'gap', candleIndex1: 0, candleIndex2: 1, direction: 'down', color: 'rgba(239,68,68,0.3)'}
                ],
                indicatorCombination: "Volume may increase on the gapping candles, confirming the bearish momentum. A break of key support levels after the pattern reinforces the signal."
            },
            // Bearish Strength/Continuation
            {
                id: 'bearish_marubozu',
                name: 'Bearish Marubozu',
                description: 'A Bearish Marubozu is a long red (or black) candle with no upper or lower shadows. The opening price is the same as the high price, and the closing price is the same as the low price.',
                interpretation: 'Shows extreme bearish strength. The sellers controlled the price from the open to the close. Can signal the beginning of a bearish trend or the continuation of a downtrend.',
                type: 'Bearish Strength/Continuation',
                candles: [{ open: 70, high: 70, low: 40, close: 40, trend: 'any' }],
                keyFeatures: [{ type: 'body', candleIndex: 0 }],
                indicatorCombination: "High volume on a Bearish Marubozu confirms the strength of the sellers. In an uptrend, it can initiate a strong reversal after an overbought phase (RSI > 70)."
            },
            // NEW: Reversal Signals by Wicks
            {
                id: 'retracing_wicks',
                name: 'Retracing Wicks',
                type: 'Reversal Signals by Wicks',
                description: 'After an uptrend, two or more candles form long upper wicks at a similar price level (resistance). The second wick candle already closes bearish, signaling the beginning of the trend change. A strong red follow-up candle confirms the reversal.',
                interpretation: 'The long wicks show repeated rejection of higher prices. The color change to a red candle on the second test is the crucial signal that sellers are gaining the upper hand. The subsequent red candle confirms the new downward momentum.',
                candles: [
                    { open: 50, high: 60, low: 48, close: 58, trend: 'uptrend' },
                    { open: 58, high: 82, low: 57, close: 70 }, // First wick
                    { open: 70, high: 81.5, low: 62, close: 64 }, // Second wick, bearish
                    { open: 64, high: 65, low: 40, close: 45 }  // Strong bearish confirmation candle
                ],
                keyFeatures: [
                    { type: 'shadow', candleIndex: 1, shadowType: 'upper' },
                    { type: 'shadow', candleIndex: 2, shadowType: 'upper' },
                    { type: 'line', yValue1Property: 'high', candleIndex1: 1, yValue2Property: 'high', candleIndex2: 2, color: '#FACC15', lineWidth: 2, dashed: true },
                    { type: 'body', candleIndex: 3, color: 'rgba(239, 68, 68, 0.4)', borderColor: '#EF4444' }
                ],
                indicatorCombination: "The signal is stronger if the wick candles occur on high volume. A bearish divergence on oscillators (RSI, MACD) increases the significance."
            },
            {
                id: 'advancing_wicks',
                name: 'Advancing Wicks',
                type: 'Reversal Signals by Wicks',
                description: 'After a downtrend, two or more candles form long lower wicks at a similar price level (support). The second wick candle already closes bullish, signaling the beginning of the trend change. A strong green follow-up candle confirms the reversal.',
                interpretation: 'The long wicks show repeated rejection of lower prices. The color change to a green candle on the second test is the crucial signal that buyers are gaining the upper hand. The subsequent green candle confirms the new upward momentum.',
                candles: [
                    { open: 90, high: 92, low: 75, close: 78, trend: 'downtrend' },
                    { open: 78, high: 79, low: 48, close: 62 }, // First wick
                    { open: 62, high: 68, low: 49, close: 67 }, // Second wick, bullish
                    { open: 67, high: 90, low: 66, close: 88 }  // Strong bullish confirmation candle
                ],
                keyFeatures: [
                    { type: 'shadow', candleIndex: 1, shadowType: 'lower' },
                    { type: 'shadow', candleIndex: 2, shadowType: 'lower' },
                    { type: 'line', yValue1Property: 'low', candleIndex1: 1, yValue2Property: 'low', candleIndex2: 2, color: '#FACC15', lineWidth: 2, dashed: true },
                    { type: 'body', candleIndex: 3, color: 'rgba(34, 197, 94, 0.4)', borderColor: '#22C55E' }
                ],
                indicatorCombination: "The signal is reinforced by high volume on the wick candles and the bullish confirmation candle. A bullish divergence in the RSI or MACD makes a successful reversal more likely."
            }
        ];

export const candlestickPatterns: CandlestickPattern[] = INTERNAL_ALL_PATTERNS.map(pattern => {
    const candlesWithDefaults = pattern.candles.map(candle => ({ ...candle }));
    return {
        ...defaultPatternInfoExtension,
        ...pattern,
        candles: candlesWithDefaults
    };
});

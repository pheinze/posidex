<script lang="ts">
    import type { CandlestickPattern } from "../../lib/data/candlesticks";
    import { afterUpdate } from "svelte";

    export let pattern: CandlestickPattern | null = null;

    let canvas: HTMLCanvasElement;

    afterUpdate(() => {
        if (pattern && canvas) {
            drawCandlestickChart(pattern);
        }
    });

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    function drawCandlestickChart(pattern: CandlestickPattern) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const candles = pattern.candles;
        const numCandles = candles.length;

        const container = canvas.parentElement;
        if (!container) return;

        const dpi = window.devicePixelRatio || 1;
        canvas.width = container.clientWidth * dpi;
        canvas.height = container.clientHeight * dpi;
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = container.clientHeight + 'px';
        ctx.scale(dpi, dpi);

        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let minPrice = Infinity;
        let maxPrice = -Infinity;

        candles.forEach(candle => {
            minPrice = Math.min(minPrice, candle.low);
            maxPrice = Math.max(maxPrice, candle.high);
        });

        const pricePadding = (maxPrice - minPrice) * 0.15;
        minPrice -= pricePadding;
        maxPrice += pricePadding;
        if (minPrice < 0 && candles.every(c => c.low >=0)) minPrice = 0;
        if (maxPrice === minPrice) {
            maxPrice += 10;
            minPrice = Math.max(0, minPrice -10);
        }

        const priceRange = maxPrice - minPrice;
        const candleWidth = canvasWidth / (numCandles + 2);
        const wickLineWidth = 4 * dpi;
        const bodyMaxWidth = candleWidth * 0.7;
        const cornerRadius = 10;

        const bullishColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim() || '#22C55E';
        const bearishColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim() || '#EF4444';
        const dojiColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#9CA3AF';
        const wickColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6B7280';
        const trendLineColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#4B5563';

        ctx.lineCap = 'round';

        function getY(price: number) {
            if (priceRange === 0) return canvasHeight / 2;
            return canvasHeight - ((price - minPrice) / priceRange) * canvasHeight;
        }

        const candleCoords: {x:number, openY:number, closeY:number, highY:number, lowY:number, candle: typeof candles[0]}[] = [];

        const firstCandleData = candles[0];
        if (firstCandleData.trend && firstCandleData.trend !== 'any') {
            ctx.beginPath();
            ctx.strokeStyle = trendLineColor;
            ctx.lineWidth = 2 * dpi;
            ctx.setLineDash([5 * dpi, 3 * dpi]);
            const trendStartX = candleWidth * 0.5;
            const trendEndX = candleWidth * 1.5 - (bodyMaxWidth / 2) - 10;
            let trendStartY, trendEndY;
            let firstCandleRelevantY;

            if (firstCandleData.trend === 'downtrend' || firstCandleData.trend === 'uptrend_peak') {
                    firstCandleRelevantY = getY(Math.max(firstCandleData.open, firstCandleData.close, firstCandleData.high));
            } else {
                    firstCandleRelevantY = getY(Math.min(firstCandleData.open, firstCandleData.close, firstCandleData.low));
            }

            if (firstCandleData.trend === 'downtrend') {
                trendStartY = firstCandleRelevantY - canvasHeight * 0.25;
                trendEndY = firstCandleRelevantY + canvasHeight * 0.05;
            } else {
                trendStartY = firstCandleRelevantY + canvasHeight * 0.25;
                trendEndY = firstCandleRelevantY - canvasHeight * 0.05;
            }
            ctx.moveTo(trendStartX, trendStartY);
            ctx.lineTo(trendEndX, trendEndY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        candles.forEach((candle, index) => {
            const x = candleWidth * (index + 1.5) ;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);

            candleCoords.push({ x, openY, closeY, highY, lowY, candle });

            ctx.beginPath();
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = wickLineWidth;
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            const bodyHeight = Math.abs(openY - closeY);
            const bodyY = Math.min(openY, closeY);
            let bodyColor = dojiColor;
            if (candle.close > candle.open) {
                bodyColor = bullishColor;
            } else if (candle.close < candle.open) {
                bodyColor = bearishColor;
            }

            if (bodyHeight < 1 * dpi && Math.abs(candle.open - candle.close) < 0.1) {
                ctx.beginPath();
                ctx.strokeStyle = bodyColor;
                ctx.lineWidth = Math.max(2 * dpi, wickLineWidth);
                ctx.moveTo(x - bodyMaxWidth / 2, openY);
                ctx.lineTo(x + bodyMaxWidth / 2, openY);
                ctx.stroke();
            } else {
                ctx.fillStyle = bodyColor;
                roundRect(ctx, x - bodyMaxWidth / 2, bodyY, bodyMaxWidth, bodyHeight, cornerRadius * dpi);
                ctx.fill();
            }
        });

        if (pattern.keyFeatures) {
            pattern.keyFeatures.forEach(feature => {
                const coord = feature.candleIndex !== undefined ? candleCoords[feature.candleIndex] : null;
                ctx.fillStyle = feature.color || 'rgba(250, 204, 21, 0.3)';
                ctx.strokeStyle = feature.borderColor || '#FACC15';
                ctx.lineWidth = feature.lineWidth || (2 * dpi);
                const highlightRadius = cornerRadius * dpi;

                if (feature.type === 'body' && coord) {
                    const bodyY = Math.min(coord.openY, coord.closeY);
                    const bodyHeight = Math.abs(coord.openY - coord.closeY);
                    const minHighlightHeight = 2 * dpi;
                    const actualBodyHeight = bodyHeight < minHighlightHeight && Math.abs(coord.candle.open - coord.candle.close) < 0.1 ? minHighlightHeight : bodyHeight;
                    const actualBodyY = bodyHeight < minHighlightHeight && Math.abs(coord.candle.open - coord.candle.close) < 0.1 ? coord.openY - (minHighlightHeight / 2) : bodyY;

                    roundRect(ctx, coord.x - bodyMaxWidth / 2, actualBodyY, bodyMaxWidth, actualBodyHeight, highlightRadius);
                    ctx.fill();
                    if (feature.borderColor) {
                        roundRect(ctx, coord.x - bodyMaxWidth / 2, actualBodyY, bodyMaxWidth, actualBodyHeight, highlightRadius);
                        ctx.stroke();
                    }
                } else if (feature.type === 'shadow' && coord) {
                        if (feature.shadowType === 'lower') {
                        const shadowTop = Math.max(coord.openY, coord.closeY);
                        ctx.beginPath();
                        ctx.moveTo(coord.x, shadowTop);
                        ctx.lineTo(coord.x, coord.lowY);
                        ctx.stroke();
                    } else if (feature.shadowType === 'upper') {
                        const shadowBottom = Math.min(coord.openY, coord.closeY);
                        ctx.beginPath();
                        ctx.moveTo(coord.x, shadowBottom);
                        ctx.lineTo(coord.x, coord.highY);
                        ctx.stroke();
                    }
                } else if (feature.candleIndex1 !== undefined && feature.candleIndex2 !== undefined && candleCoords[feature.candleIndex1] && candleCoords[feature.candleIndex2]) {
                    const coord1 = candleCoords[feature.candleIndex1];
                    const coord2 = candleCoords[feature.candleIndex2];
                    const c1 = coord1.candle;
                    const c2 = coord2.candle;

                    if (feature.type === 'engulf') {
                        const c2Coord = coord2;
                        const c2BodyTopY = getY(Math.max(c2.open, c2.close));
                        const c2BodyBottomY = getY(Math.min(c2.open, c2.close));
                        const engulfX = c2Coord.x - bodyMaxWidth / 2;
                        const engulfHeight = Math.abs(c2BodyTopY - c2BodyBottomY);

                        roundRect(ctx, engulfX - 2, Math.min(c2BodyTopY, c2BodyBottomY), bodyMaxWidth + 4, engulfHeight, highlightRadius);
                        ctx.fill();
                        if (feature.borderColor) {
                            roundRect(ctx, engulfX -2 , Math.min(c2BodyTopY, c2BodyBottomY), bodyMaxWidth + 4, engulfHeight, highlightRadius);
                            ctx.stroke();
                        }
                    } else if (feature.type === 'gap') {
                        let gapY1, gapY2;
                        if (feature.direction === 'up') { gapY1 = coord1.highY; gapY2 = coord2.lowY; }
                        else if (feature.direction === 'down') { gapY1 = coord2.highY; gapY2 = coord1.lowY; }
                        else { gapY1 = coord1.highY; gapY2 = coord2.lowY; if (coord1.lowY < coord2.highY) { gapY1 = coord2.highY; gapY2 = coord1.lowY; } }

                        const gapX = (coord1.x + coord2.x) / 2 - (bodyMaxWidth / 4) ;
                        const gapHeight = Math.abs(gapY1 - gapY2);
                        const gapRectY = Math.min(gapY1, gapY2);

                        if (gapHeight > 1 * dpi) {
                            roundRect(ctx, gapX, gapRectY, bodyMaxWidth / 2, gapHeight, highlightRadius);
                            ctx.fill();
                            if (feature.borderColor) { roundRect(ctx, gapX, gapRectY, bodyMaxWidth / 2, gapHeight, highlightRadius); ctx.stroke(); }
                        }
                    } else if (feature.type === 'line' && feature.yValue1Property && feature.yValue2Property) {
                        const yVal1 = c1[feature.yValue1Property];
                        const yVal2 = c2[feature.yValue2Property];
                        const y1 = getY(yVal1);
                        const y2 = getY(yVal2);

                        ctx.beginPath();
                        ctx.strokeStyle = feature.color || '#FACC15';
                        ctx.lineWidth = feature.lineWidth || (2 * dpi);
                        if (feature.dashed) { ctx.setLineDash([5 * dpi, 3 * dpi]); }
                        ctx.moveTo(coord1.x, y1);
                        ctx.lineTo(coord2.x, y2);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    } else if (feature.type === 'body_inside_body') {
                        const innerBodyY = Math.min(coord2.openY, coord2.closeY);
                        const innerBodyHeight = Math.abs(coord2.openY - coord2.closeY);

                        roundRect(ctx, coord2.x - bodyMaxWidth / 2, innerBodyY, bodyMaxWidth, innerBodyHeight, highlightRadius);
                        ctx.fill();
                        if (feature.borderColor) { roundRect(ctx, coord2.x - bodyMaxWidth / 2, innerBodyY, bodyMaxWidth, innerBodyHeight, highlightRadius); ctx.stroke(); }
                    } else if (feature.type === 'penetration') {
                        const c1BodyMiddleY = getY((c1.open + c1.close) / 2);
                        const c2CloseY = getY(c2.close);

                        if (c2.close > (c1.open + c1.close) / 2 && c2.close < Math.max(c1.open, c1.close)) {
                            const penetrationX = coord2.x - bodyMaxWidth / 2;
                            const penetrationHeight = Math.abs(c2CloseY - c1BodyMiddleY);
                            roundRect(ctx, penetrationX, Math.min(c2CloseY, c1BodyMiddleY), bodyMaxWidth, penetrationHeight, highlightRadius);
                            ctx.fill();
                            if (feature.borderColor) { roundRect(ctx, penetrationX, Math.min(c2CloseY, c1BodyMiddleY), bodyMaxWidth, penetrationHeight, highlightRadius); ctx.stroke(); }
                        } else if (c2.close < (c1.open + c1.close) / 2 && c2.close > Math.min(c1.open, c1.close)) {
                            const penetrationX = coord2.x - bodyMaxWidth / 2;
                            const penetrationHeight = Math.abs(c2CloseY - c1BodyMiddleY);
                            roundRect(ctx, penetrationX, Math.min(c2CloseY, c1BodyMiddleY), bodyMaxWidth, penetrationHeight, highlightRadius);
                            ctx.fill();
                            if (feature.borderColor) { roundRect(ctx, penetrationX, Math.min(c2CloseY, c1BodyMiddleY), bodyMaxWidth, penetrationHeight, highlightRadius); ctx.stroke(); }
                        }
                    }
                } else if (feature.type === 'body_range' && coord) {
                    const bodyTopY = getY(coord.candle.high);
                    const bodyBottomY = getY(coord.candle.low);
                    const bodyHeight = Math.abs(bodyTopY - bodyBottomY);
                    roundRect(ctx, coord.x - bodyMaxWidth / 1.8, Math.min(bodyTopY, bodyBottomY), bodyMaxWidth * 1.1, bodyHeight, highlightRadius / 2);
                    ctx.fill();
                    if (feature.borderColor) { roundRect(ctx, coord.x - bodyMaxWidth / 1.8, Math.min(bodyTopY, bodyBottomY), bodyMaxWidth * 1.1, bodyHeight, highlightRadius / 2); ctx.stroke(); }
                } else if (feature.type === 'low_point' && coord) {
                    ctx.beginPath();
                    ctx.arc(coord.x, coord.lowY, feature.radius || 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    if (feature.borderColor) { ctx.strokeStyle = feature.borderColor; ctx.stroke(); }
                }  else if (feature.type === 'high_point' && coord) {
                    ctx.beginPath();
                    ctx.arc(coord.x, coord.highY, feature.radius || 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    if (feature.borderColor) { ctx.strokeStyle = feature.borderColor; ctx.stroke(); }
                }
            });
        }
    }
</script>

<main class="main-content">
    <section class="chart-display-section">
        <canvas bind:this={canvas} class="chart-canvas"></canvas>
    </section>

    <section class="pattern-info-section custom-scrollbar">
        {#if pattern}
            <div class="pattern-info-header">
                <h2 class="pattern-title">{pattern.name}</h2>
            </div>
            <div class="info-details">
                <div>
                    <h3 class="info-details-heading">Description:</h3>
                    <p class="info-details-text">{@html pattern.description}</p>
                </div>
                <div>
                    <h3 class="info-details-heading">Interpretation:</h3>
                    <p class="info-details-text">{@html pattern.interpretation}</p>
                </div>
                    <div>
                    <h3 class="info-details-heading">Type:</h3>
                    <p class="info-details-text">{pattern.type}</p>
                </div>
                <div>
                    <h3 class="info-details-heading">Combination with Technical Indicators:</h3>
                    <p class="info-details-text">{@html pattern.indicatorCombination}</p>
                </div>
            </div>
        {:else}
            <div class="info-details-text">Select a pattern to see the details.</div>
        {/if}
    </section>
</main>

<style>
    .main-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .chart-display-section {
        background-color: var(--bg-secondary);
        padding: 1rem;
        border-radius: 0.5rem;
        height: 20rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: background-color 0.3s ease;
    }
    .chart-canvas {
        border-radius: 0.375rem;
        background-color: var(--bg-primary);
        width: 100%;
        height: 100%;
        transition: background-color 0.3s ease;
    }
    .pattern-info-section {
        background-color: var(--bg-secondary);
        padding: 1rem;
        border-radius: 0.5rem;
        max-height: calc(100vh - 400px);
        overflow-y: auto;
        transition: background-color 0.3s ease;
    }
    .pattern-info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        position: sticky;
        top: 0;
        background-color: var(--bg-secondary);
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        z-index: 10;
        transition: background-color 0.3s ease;
    }
    .pattern-title {
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 600;
        color: var(--accent-color);
    }
    .info-details > div:not(:last-child) {
        margin-bottom: 0.75rem;
    }
    .info-details-heading {
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: 500;
        color: var(--accent-color);
        opacity: 0.9;
        margin-bottom: 0.25rem;
    }
    .info-details-text {
        color: var(--text-primary);
        font-size: 0.875rem;
        line-height: 1.625;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--text-secondary);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--border-color);
    }
</style>

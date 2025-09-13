<script lang="ts">
    import type { ChartPattern } from "../../lib/data/patterns";
    import { onMount, afterUpdate } from "svelte";

    export let pattern: ChartPattern | null = null;
    export let showMA = false;
    export let showRSI = false;

    let chartCanvas: HTMLCanvasElement;
    let rsiCanvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rsiCtx: CanvasRenderingContext2D;
    let baseWidth: number, baseChartHeight: number, rsiHeight = 80;

    let prevPatternId: string | null = null;
    let prevShowMA = false;
    let prevShowRSI = false;

    afterUpdate(() => {
        if (pattern && ctx && (pattern.id !== prevPatternId || showMA !== prevShowMA || showRSI !== prevShowRSI)) {
            resizeCanvas();
            prevPatternId = pattern.id;
            prevShowMA = showMA;
            prevShowRSI = showRSI;
        }
    });

    onMount(() => {
        ctx = chartCanvas.getContext('2d')!;
        rsiCtx = rsiCanvas.getContext('2d')!;
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        }
    });

    const drawingFunctions: Record<string, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
        // This is where the draw functions from the original file would be mapped
        // A real implementation would have all of them.
        headAndShoulders: (ctx, w, h) => {
            const neckY = h * 0.6;
            drawLine(ctx, w * 0.1, neckY, w * 0.9, neckY, '#e5e7eb', 2);
            drawPeak(ctx, w * 0.25, h * 0.4, w * 0.15, neckY, '#fca5a5');
            drawPeak(ctx, w * 0.5, h * 0.2, w * 0.2, neckY, '#ef4444');
            drawPeak(ctx, w * 0.75, h * 0.45, w * 0.15, neckY, '#fca5a5');
            drawText(ctx, 'L Schulter', w * 0.25, h * 0.38, '#fde047');
            drawText(ctx, 'Kopf', w * 0.5, h * 0.18, '#fde047');
            drawText(ctx, 'R Schulter', w * 0.75, h * 0.43, '#fde047');
            drawText(ctx, 'Nackenlinie', w * 0.5, neckY + 20, '#e5e7eb');
            drawArrow(ctx, w * 0.8, neckY, w * 0.8, neckY + h*0.2, '#ef4444', 2);
            drawText(ctx, 'Ausbruch', w * 0.8, neckY + h*0.2 + 20, '#ef4444');
        },
    };

    function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#e5e7eb', width = 1) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }
    function drawPeak(ctx: CanvasRenderingContext2D, centerX: number, peakY: number, width: number, baseY: number, color: string) { const halfWidth = width / 2; ctx.beginPath(); ctx.moveTo(centerX - halfWidth, baseY); ctx.lineTo(centerX, peakY); ctx.lineTo(centerX + halfWidth, baseY); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
    function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = '#e5e7eb', size = '12px') { ctx.fillStyle = color; ctx.font = `${size} Inter`; ctx.textAlign = 'center'; ctx.fillText(text, x, y);}
    function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color = '#e5e7eb', width = 2) { const headLength = 10; const angle = Math.atan2(toY - fromY, toX - fromX); drawLine(ctx, fromX, fromY, toX, toY, color, width);  const path = new Path2D(); path.moveTo(toX, toY); path.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6)); path.moveTo(toX, toY); path.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6)); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(path); }
    function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, step = 50, color = '#374151') { ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 0.5; for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h);} for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y);} ctx.stroke(); }

    function drawIllustrativeMA(mainCtx: CanvasRenderingContext2D, w: number, h: number) { mainCtx.beginPath(); mainCtx.strokeStyle = '#f97316'; mainCtx.lineWidth = 1.5; mainCtx.setLineDash([5, 3]); mainCtx.moveTo(w * 0.1, h * 0.7); mainCtx.bezierCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.4, w * 0.9, h * 0.3); mainCtx.stroke(); mainCtx.setLineDash([]); }

    function drawIllustrativeRSI(rsiCtx: CanvasRenderingContext2D, w: number, h: number) {
        rsiCtx.clearRect(0, 0, w, h);
        drawGrid(rsiCtx, w, h, 20, '#2a313c');
        const rsiLevels: Record<string, number> = { '70': h * 0.3, '50': h * 0.5, '30': h * 0.7 };
        for (const [level, yPos] of Object.entries(rsiLevels)) {
            rsiCtx.beginPath(); rsiCtx.moveTo(0, yPos); rsiCtx.lineTo(w, yPos); rsiCtx.strokeStyle = '#6b7280'; rsiCtx.lineWidth = 1; rsiCtx.stroke();
            drawText(rsiCtx, level, w - 20, yPos - 5, '#9ca3af', '10px');
        }
        drawText(rsiCtx, 'RSI', 25, 15, '#9ca3af');
        rsiCtx.beginPath(); rsiCtx.strokeStyle = '#a78bfa'; rsiCtx.lineWidth = 1.5; rsiCtx.moveTo(w * 0.1, rsiLevels['30']); rsiCtx.bezierCurveTo(w * 0.3, rsiLevels['70'], w * 0.6, rsiLevels['30'], w * 0.9, rsiLevels['50']); rsiCtx.stroke();
    }

    function redrawEverything() {
        if (!ctx) return;
        ctx.clearRect(0, 0, baseWidth, baseChartHeight);
        drawGrid(ctx, baseWidth, baseChartHeight);

        if (pattern && drawingFunctions[pattern.id]) {
            drawingFunctions[pattern.id](ctx, baseWidth, baseChartHeight);
        } else if (pattern) {
            drawText(ctx, pattern.name, baseWidth / 2, baseChartHeight / 2, 'var(--text-primary)', '16px');
        } else {
            drawText(ctx, 'Bitte wählen Sie ein Chartmuster aus.', baseWidth / 2, baseChartHeight / 2, 'var(--text-secondary)');
        }

        if (showMA) {
            drawIllustrativeMA(ctx, baseWidth, baseChartHeight);
        }

        if (showRSI) {
            rsiCanvas.style.display = 'block';
            drawIllustrativeRSI(rsiCtx, baseWidth, rsiHeight);
        } else {
            rsiCanvas.style.display = 'none';
        }
    }

    function resizeCanvas() {
        if (!chartCanvas || !rsiCanvas || !chartCanvas.parentElement) return;
        const dpr = window.devicePixelRatio || 1;
        const containerRect = chartCanvas.parentElement!.getBoundingClientRect();
        baseWidth = containerRect.width;

        let mainCanvasHeight;
        if (showRSI) {
            rsiCanvas.style.display = 'block';
            mainCanvasHeight = (baseWidth * (9/16)) * 0.75;
            rsiHeight = (baseWidth * (9/16)) * 0.25 -16;
            if (mainCanvasHeight < 150) mainCanvasHeight = 150;
            if (rsiHeight < 60) rsiHeight = 60;

            rsiCanvas.width = baseWidth * dpr;
            rsiCanvas.height = rsiHeight * dpr;
            rsiCanvas.style.width = `${baseWidth}px`;
            rsiCanvas.style.height = `${rsiHeight}px`;
            if (rsiCtx) rsiCtx.scale(dpr, dpr);
        } else {
            rsiCanvas.style.display = 'none';
            mainCanvasHeight = baseWidth * (9/16);
        }

        chartCanvas.width = baseWidth * dpr;
        chartCanvas.height = mainCanvasHeight * dpr;
        chartCanvas.style.width = `${baseWidth}px`;
        chartCanvas.style.height = `${mainCanvasHeight}px`;
        if (ctx) ctx.scale(dpr, dpr);

        baseChartHeight = mainCanvasHeight;

        redrawEverything();
    }
</script>

<div class="charts-container">
    <canvas bind:this={chartCanvas}></canvas>
    <canvas bind:this={rsiCanvas} id="rsiCanvas" style="display:none;"></canvas>
</div>

<style>
    .charts-container {
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background-color: var(--bg-secondary);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 1rem;
        width: 100%;
        overflow: hidden;
    }
    canvas {
        width: 100% !important;
        margin-left: auto;
        margin-right: auto;
        height: auto;
        border-radius: 0.375rem;
        display: block;
    }
    canvas[style*="display: none;"] {
        display: none !important;
    }
    #rsiCanvas {
        border-top: 1px solid var(--border-color);
        margin-top: 1rem;
    }
</style>

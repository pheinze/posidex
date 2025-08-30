const e=`# Guide: Trading Dashboard

Welcome to the Trading Dashboard! This tool is designed to help you precisely calculate your position size and analyze potential trades, based on sound risk management. Understand your metrics at a glance and make informed decisions.

## 1. Input Fundamentals

Before you start calculating, please enter the required trade data.

### General
*   **Trade Type:** Choose whether you want to enter a **Long** (buy) or **Short** (sell) position.
*   **Leverage:** Enter the leverage you want to use (e.g., \`10x\`, \`20x\`).
*   **Fees per Trade (%):** Enter your exchange's estimated trading fees as a percentage (e.g., \`0.075\` for 0.075%).

### Portfolio
*   **Account Balance:** Your total available capital in the trading account.
*   **Risk per Trade (%):** The percentage of your account balance you are willing to risk per trade (e.g., \`1\` for 1%).

### Trade Setup
*   **Symbol:** The trading pair you want to analyze (e.g., \`BTCUSDT\`, \`ETHUSDT\`). Click the **arrow button** to load the current live price from Binance.
*   **Entry Price:** The price at which you intend to open the position.
*   **Stop-Loss Price:** The price at which your position will be automatically closed to limit losses. You have two options:
    *   **Manual Stop-Loss:** Enter the desired stop-loss price directly.
    *   **ATR Stop-Loss:** Activate the switch to calculate the stop-loss based on the Average True Range (ATR) indicator.
        *   **ATR Value:** The current value of the ATR indicator for the selected timeframe.
        *   **Multiplier:** A factor by which the ATR value is multiplied (common examples are \`1.5\` or \`2\`).
        *   **Formula (Long):** \`Stop-Loss = Entry Price - (ATR Value * Multiplier)\`
        *   **Formula (Short):** \`Stop-Loss = Entry Price + (ATR Value * Multiplier)\`

## 2. Take-Profit Targets (Partial)

Set multiple take-profit targets to gradually realize your profits.

*   **Price:** The target price at which a portion of your position should be sold.
*   **Percentage:** The percentage of your *original* position size that should be sold at this target price. The sum of all percentages cannot exceed 100%.
*   **Lock Icon:** Lock/unlock the percentage to maintain it during adjustments.
*   **Remove:** Delete a take-profit target.
*   **Add another target:** Add additional take-profit targets.

## 3. Summary & Metrics

After you have made all entries, the Dashboard automatically calculates important metrics:

### Position Size
*   **Position Size:** The most important metric! It tells you how many units of the asset you should buy/sell to adhere to your defined risk per trade.
*   **Lock Position Size:** Click the lock icon next to the position size. When locked, the position size remains fixed. Changes to the stop-loss or entry price will then affect your risk in % instead of adjusting the position size. This is useful to see how an SL adjustment impacts your risk while keeping the position size constant.
*   **Copy:** Copy the calculated position size to the clipboard.

### Total Trade Metrics
These metrics give you an overview of the entire trade if all take-profit targets were reached.

*   **Risk per Trade (Currency):** The absolute amount of money you risk at most, based on your account balance and risk per trade (%).
*   **Total Fees:** The estimated total cost for this trade (buy, sell, stop-loss/take-profit).
*   **Max. Potential Profit:** The maximum net profit if the entire position were closed at the best TP.
*   **Weighted R/R (Risk/Reward):** The average risk-reward ratio of all partial sales. A higher R/R is better.
*   **Total Net Profit:** The accumulated net profit from all partial sales.
*   **Sold Position:** The total percentage of the original position that is sold through the take-profit targets.

### Further Metrics
*   **Required Margin:** The capital blocked from your account for this trade.
*   **Est. Liquidation Price:** The estimated price at which your position will be liquidated if you use leverage.
*   **Break-Even Price:** The price at which your trade makes zero profit/loss, considering all fees.

## 4. Visual Analysis

The visual bar provides a graphical representation of your trade:

*   **Entry Price:** Marks your buy/sell price.
*   **Stop-Loss:** Shows the point at which your trade will be closed to limit losses.
*   **Take-Profit Targets:** Marks your profit targets.
*   **Profit/Loss Zones:** Colored areas indicate where you would make a profit or loss.
*   **Tooltips:** Hover over the TP markers to see details on net profit and R/R for that specific partial sale.

## 5. Presets

Save your frequently used settings as a preset to quickly load them again. This is ideal for different strategies or markets.

## 6. Add Trade to Journal

After analyzing a trade, you can add it to the Trade Journal with a click to track your performance.
`;export{e as default};

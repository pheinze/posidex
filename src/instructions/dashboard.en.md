# Guide: Understanding the Calculations

This guide explains in detail how the calculations in the app work. Understanding where the numbers come from will help you make the most of the tool for your risk management and trading strategy.

<p></p>

### Base Metrics

Everything starts with setting up your trade. The following metrics are the foundation for all further calculations.

*   **Risk Amount:** This is the maximum amount of money you are willing to lose on this trade.
    *   **Formula:** `Account Size * (Risk % / 100)`
    *   **Example:** On a €10,000 account with 1% risk, you are risking €100.

*   **Position Size:** This is the quantity of units of the asset (e.g., number of shares or coins) you need to buy or sell to risk exactly your desired risk amount.
    *   **Formula:** `Risk Amount / |Entry Price - Stop-Loss Price|`
    *   **Benefit:** This calculation is crucial for ensuring consistent risk in every trade, regardless of market volatility.

*   **Order Volume:** The total value of your position in the base currency (e.g., USDT).
    *   **Formula:** `Position Size * Entry Price`

*   **Required Margin:** The capital you actually need to post as collateral (margin) in your account to open the leveraged position.
    *   **Formula:** `Order Volume / Leverage`
    *   **Note:** With a leverage of 1 (or no leverage), the margin equals the full order volume.

*   **Net Loss:** The actual loss if your stop-loss is triggered. It accounts not only for the risk amount but also for the fees to open and close the position.
    *   **Formula:** `Risk Amount + Entry Fee + Stop-Loss Exit Fee`

*   **Break-Even Price:** The price at which your trade makes neither a profit nor a loss, as the potential gains exactly cover the trading fees.
    *   **Benefit:** A useful reference point to know when your trade becomes profitable.

*   **Liquidation Price:** (Leveraged trades only) The price at which your position is automatically closed by the exchange because your margin capital is depleted.
    *   **Warning:** This price should always be far from your stop-loss to avoid an unwanted liquidation.

<p></p>

### Take-Profit (TP) Target Metrics

Individual metrics are calculated for each take-profit target.

*   **Net Profit:** The net gain for a partial sale at a TP target. It accounts for the proportional fees.
    *   **Formula:** `Gross Profit of the Part - Proportional Entry Fee - Exit Fee`

*   **Risk/Reward Ratio:** Shows how much profit you are making in relation to the risk taken for that portion of the position.
    *   **Formula:** `Net Profit / Proportional Risk Amount`
    *   **Benefit:** An R/R of 2:1 means the potential profit of this partial sale is twice the risk taken for it.

*   **Return on Capital (ROC):** Shows the percentage return on the margin capital used for this partial sale.
    *   **Formula:** `(Net Profit / (Required Margin * Sell Portion %)) * 100`

<p></p>

### Total Trade Metrics

These metrics summarize the performance of the entire trade across all take-profit targets.

*   **Total Net Profit:** The sum of the net profits from all your partial sales.
*   **Weighted R/R:** The average risk/reward ratio of the entire trade, weighted by the percentage share of each target.
*   **Max Potential Profit:** The net profit you would make if you sold 100% of your position at the best of your set TP targets.

By understanding these calculations, you can make more informed trading decisions and plan your strategy with precision.

This guide breaks down the magic behind the numbers. It shows you step-by-step how Cachy calculates the key trading metrics from your inputs. Every formula is explained with a clear example, so you can understand exactly how the results come about and what they mean for your trading decisions.

#### **The Inputs - Our Example Values**

For all the following calculations, we will use a consistent example so you can easily follow the connections.

*   **Trade Type:** `Long`
*   **Account Balance:** `€1,000`
*   **Risk per Trade:** `2 %`
*   **Leverage:** `10x`
*   **Fees:** `0.1 %` (for entry and exit)
*   **Entry Price:** `€100`
*   **Stop Loss Price:** `€98`

---

### **Part 1: The Core Calculations**

These are the fundamental metrics calculated for every trade.

**1. Risk Amount (€)**
*   **What it is:** The maximum amount of money you are risking on this trade, based on your risk percentage.
*   **Formula:** `Account Balance * (Risk per Trade / 100)`
*   **Example:** `€1,000 * (2 / 100) = €20`

**2. Position Size**
*   **What it is:** The amount of the asset you need to buy to risk exactly your specified risk amount. This is the most critical calculation for risk management.
*   **Formula:** `Risk Amount / |Entry Price - Stop Loss Price|` (The absolute value `|...|` is used so it works for both Long and Short trades)
*   **Example:** `€20 / |€100 - €98| = 10 units`

**3. Required Margin**
*   **What it is:** The capital that is held from your account as collateral for the leveraged position. With 1x leverage, the margin equals the full order value.
*   **Formula:** `(Position Size * Entry Price) / Leverage`
*   **Example:** `(10 units * €100) / 10 = €100`

**4. Max Net Loss**
*   **What it is:** Your actual, maximum loss in euros if the stop loss is hit. This value already includes the fees for opening (entry) and closing (exit at SL) the position.
*   **Formulas:**
    *   `Entry Fee = (Position Size * Entry Price) * (Fees / 100)`
    *   `Stop Loss Exit Fee = (Position Size * Stop Loss Price) * (Fees / 100)`
    *   `Max Net Loss = Risk Amount + Entry Fee + Stop Loss Exit Fee`
*   **Example:**
    *   `Entry Fee = (10 * €100) * 0.001 = €1`
    *   `Stop Loss Exit Fee = (10 * €98) * 0.001 = €0.98`
    *   `Max Net Loss = €20 + €1 + €0.98 = €21.98`

**5. Break-Even Price**
*   **What it is:** The price at which you can exit the trade with zero profit or loss. At this point, the costs for entry and exit fees are covered.
*   **Formula (Long):** `Entry Price * (1 + Fees%) / (1 - Fees%)`
*   **Example:** `€100 * (1 + 0.001) / (1 - 0.001) ≈ €100.20`

**6. Estimated Liquidation Price**
*   **What it is:** An estimate of the price at which your position will be forcibly closed by the exchange because the loss has used up the posted margin. (This is a simplified formula; the actual calculation by exchanges may vary slightly).
*   **Formula (Long):** `Entry Price * (1 - (1 / Leverage))`
*   **Example:** `€100 * (1 - (1 / 10)) = €90`

---

### **Part 2: Take-Profit Calculations**

When you set Take-Profit (TP) targets, separate metrics are calculated for each target. Let's assume you have set a target:

*   **TP 1 Price:** `€104`
*   **Portion to sell:** `50 %`

**1. Net Profit (per target)**
*   **What it is:** The net profit for this specific partial sale, after deducting the proportional fees for entry and exit.
*   **Formulas:**
    *   `Partial Position Size = Position Size * (Portion / 100)`
    *   `Gross Profit = |TP Price - Entry Price| * Partial Position Size`
    *   `Partial Fees = (Partial Position Size * Entry Price * Fees%) + (Partial Position Size * TP Price * Fees%)`
    *   `Net Profit = Gross Profit - Partial Fees`
*   **Example (TP 1):**
    *   `Partial Position Size = 10 * 0.5 = 5 units`
    *   `Gross Profit = |€104 - €100| * 5 = €20`
    *   `Partial Fees = (5 * €100 * 0.001) + (5 * €104 * 0.001) = €0.50 + €0.52 = €1.02`
    *   `Net Profit = €20 - €1.02 = €18.98`

**2. Risk/Reward Ratio (RRR)**
*   **What it is:** Compares the potential net profit of this partial sale with the proportional risk taken for it. An RRR of 2 means you can win twice what you risked for this part of the position.
*   **Formula:** `Net Profit / (Risk Amount * (Portion / 100))`
*   **Example (TP 1):**
    *   `Partial Risk = €20 * 0.5 = €10`
    *   `RRR = €18.98 / €10 ≈ 1.90`

---

#### **Final Note**

These calculations provide a solid, data-driven foundation for your trading decisions. By understanding *how* these numbers are generated, you can improve your control over your risk management. Happy trading!

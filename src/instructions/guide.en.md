### **Cachy - How-To: A Guide to Using the Trading Calculator**

Welcome to Cachy! This guide explains all the application's features to help you optimally plan and manage your trades.

**Important Note on Data Storage:** All your inputs, presets, and journal entries are stored **exclusively locally in your browser**. No data is sent to a server. This means your data is private, but it also means it can be lost if you clear your browser data.

---

#### **1. The Basics: Trade Calculation**

Cachy's main function is to calculate your position size and other important metrics based on your risk.

**Step 1: General Inputs**
*   **Long/Short:** Choose the direction of your trade.
*   **Leverage:** Enter the leverage you want to use (e.g., 10 for 10x).
*   **Fees (%):** Enter your exchange's percentage fees (e.g., 0.04 for 0.04%).

**Step 2: Portfolio Inputs**
*   **Account Size:** Enter the total size of your trading account.
*   **Risk/Trade (%):** Define the maximum percentage of your account you want to risk on this single trade (e.g., 1 for 1%).
*   **Risk Amount:** This field displays the calculated monetary amount based on your percentage risk. You can also enter a value directly and lock it (see "Advanced Locking Features" section).

**Step 3: Trade Setup**
*   **Symbol:** Enter the trading pair (e.g., BTCUSDT).
    *   **Fetch Price:** Click the arrow button to load the current price from Binance.
*   **Entry Price:** The price at which you open the position.
*   **Stop Loss (SL):** The price at which your position is automatically closed to limit losses.
    *   **Use ATR Stop Loss:** Activate this switch to calculate the SL using ATR (Average True Range). The "Manual/Auto" options will appear.
        *   **Manual:** Enter the ATR value and a multiplier manually.
        *   **Auto:** Select a timeframe (e.g., 1h, 4h). The current ATR value is automatically fetched from Binance. You can still adjust the fetched value manually afterward.

Once all these fields are filled in, you will see the results in the right-hand section.

---

#### **2. How is Position Size Calculated?**

The core formula for calculating your position size is:

> **Position Size = Risk Amount / Risk per Share**

Where:
*   **Risk Amount:** The monetary amount you are willing to risk. It is calculated as: `Account Size * (Risk/Trade % / 100)`. If you lock the Risk Amount, this value is used directly.
*   **Risk per Share (or Coin):** The distance between your entry price and your stop-loss price.

This formula ensures that if your stop-loss is hit, you will lose exactly the amount of money you have defined.

---

#### **3. Understanding the Results**

Cachy calculates the following values for you:

*   **Position Size:** The amount of the asset you should buy/sell to adhere to your set risk.
*   **Max Net Loss:** The maximum amount of money you will lose if your stop loss is hit.
*   **Required Margin:** The amount of capital that will be locked on your account for this trade (taking leverage into account).
*   **Entry Fee:** The estimated fees for opening the position.
*   **Est. Liquidation Price:** An estimate of the price at which your position would be liquidated by the broker (only relevant for leverage > 1).
*   **Break Even Price:** The price at which you can close the position without making a profit or loss (after deducting fees).

---

#### **3. Defining Take-Profit (TP) Targets**

You can set up to 5 take-profit targets to sell parts of your position at specific prices.

*   **Add Target:** Click the **`+`** button to add a new TP row.
*   **Price & Percent:** For each target, enter the price and the percentage of the position to be sold.
*   **Automatic Adjustment:** When you change the percentage of one target, the other (unlocked) targets are automatically adjusted so that the total is always 100%.
*   **Lock Percentage:** Click the lock icon to lock the percentage of a target. This will prevent it from being changed during automatic adjustment.

For each valid TP target, you will see a detailed breakdown with metrics such as the **Net Profit** and the **Risk/Reward Ratio (RRR)** for that specific target.

---

#### **5. Advanced Features**

Cachy offers a range of tools to optimize your workflow.

**Presets**
*   **Save:** Do you have a set of inputs (e.g., for your standard setup) that you use often? Click the **Save button** (diskette icon), enter a name, and your current inputs will be saved as a preset.
*   **Load:** Select a saved preset from the dropdown menu to automatically fill in all input fields.
*   **Delete:** Select a preset and click the **Delete button** (trash can) to remove it.

**Advanced Locking Features**

You can lock certain values to have other values calculated based on them. **Only one lock can be active at a time.**

*   **Lock Position Size:**
    *   Click the **lock icon** next to the calculated **Position Size**.
    *   When this is active, the position size remains constant. If you change your stop-loss or entry price, your **Risk/Trade (%)** and **Risk Amount** will be adjusted instead. This is useful if you want to work with a fixed position size.
*   **Lock Risk Amount:**
    *   Click the **lock icon** next to the **Risk Amount**.
    *   When this is active, your maximum monetary loss is fixed. If you change your stop-loss, the **Position Size** and **Risk/Trade (%)** will be adjusted automatically.

**Trade Journal**
*   **Add Trade:** After calculating a trade, you can add notes and click **"Add Trade to Journal"**. The trade will be saved with all details in your journal.
*   **View Journal:** Click the **"Journal"** button in the top right to view all your saved trades. You can change the status of each trade (e.g., from "Open" to "Win" or "Loss").
*   **Import/Export:** In the journal window, you can **export your entire journal as a CSV file** (e.g., for Excel) or **import** an existing CSV file.

**Other Functions**
*   **Switch Theme:** Use the sun/moon icon to switch between a light and dark theme.
*   **Switch Language:** At the bottom left, you will find the option to change the user interface language.
*   **Reset All:** The broom button resets all input fields to their default values.

---

#### **5. Keyboard Shortcuts**

For faster operation, you can use the following keyboard shortcuts:

*   `Alt + L`: Switches the trade type to **Long**.
*   `Alt + S`: Switches the trade type to **Short**.
*   `Alt + R`: Resets all inputs to their default values (**Reset**).
*   `Alt + J`: Opens or closes the **Journal** window.

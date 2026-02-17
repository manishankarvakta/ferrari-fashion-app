# Ferrari Fashion App - Financial Calculation & Workflow Documentation

This document outlines the financial structure of the Ferrari Fashion application, explaining where money comes from (Inflow), where it goes (Outflow), and how these figures are calculated and displayed on the Dashboard.

## 1. Financial Data Overview

The application tracks four main types of financial transactions:
1.  **Deposit (Cash In)**
2.  **Cash Out**
3.  **Payment**
4.  **Payment Received**

These transactions affect two main balances shown in the app:
*   **Warehouse Balance**: The main actual balance of the warehouse (fetched from backend).
*   **Petty Cash Balance**: A specific calculated balance focused on daily cash operations (calculated on frontend).

---

## 2. Income Sources (Money In) 🟢

Money enters the system through the following transaction types:

### A. Cash In (Deposit)
*   **What it is:** Direct cash deposits into the warehouse/petty cash fund.
*   **Where it comes from:** Added via the "Cash Deposit" feature.
*   **Dashboard Impact:** 
    *   Increases the **"Cash In"** card value.
    *   **Adds** to the **Petty Cash Summary** `Total Deposit`.
    *   **Adds** to the **Net Cash Balance**.

### B. Payment Received
*   **What it is:** Money received from external sources, likely from customers or sales.
*   **Where it comes from:** Added via "Payment Received" feature or Sales.
*   **Dashboard Impact:**
    *   Increases the **"Received"** card value.
    *   *Note: This does **NOT** currently affect the calculated "Petty Cash Summary" on the dashboard, but it likely affects the main Warehouse Balance.*

---

## 3. Expense Sources (Money Out) 🔴

Money leaves the system through the following transaction types:

### A. Cash Out
*   **What it is:** Money taken out for expenses, withdrawals, or petty cash usage.
*   **Where it goes:** Recorded via the "Cash Out" feature.
*   **Dashboard Impact:**
    *   Increases the **"Cash Out"** card value.
    *   **Subtracts** from the **Net Cash Balance**.
    *   Shows up in **Petty Cash Summary** as `Total Cash Out`.

### B. Payment
*   **What it is:** Payments made to suppliers or for other business costs (Purchases).
*   **Where it goes:** Recorded via "Payment" feature or Purchases.
*   **Dashboard Impact:**
    *   Increases the **"Payment"** card value.
    *   *Note: This does **NOT** currently affect the calculated "Petty Cash Summary" on the dashboard, but it likely affects the main Warehouse Balance.*

---

## 4. Dashboard Calculation Logic 🧮

The Dashboard (`app/(drawer)/(tabs)/index.tsx`) uses data from the `useDashbordQuery` API. Here is the breakdown of how each section is calculated:

### Main Dashboard Cards
These values come directly from the Backend API (`dashboardData.accountsData`):

| Card Title | Data Source | Logic |
| :--- | :--- | :--- |
| **Cash In** | `accountsData.deposit.totalAmount` | Sum of all `deposit` transactions for the selected date range. |
| **Cash Out** | `accountsData.cashOut.totalAmount` | Sum of all `cashOut` transactions for the selected date range. |
| **Payment** | `accountsData.payment.totalAmount` | Sum of all `payment` transactions for the selected date range. |
| **Received** | `accountsData.paymentReceived.totalAmount` | Sum of all `paymentReceived` transactions for the selected date range. |

### Petty Cash Summary (Calculated on Frontend)
This section is calculated locally in the app to show a quick snapshot of cash flow.

**Formula:**
```javascript
Total Deposit = accountsData.deposit.totalAmount
Total Cash Out = accountsData.cashOut.totalAmount

Net Cash Balance = Total Deposit - Total Cash Out
```
*Note: This specific summary ignores 'Payment' and 'Payment Received' types, focusing purely on 'Deposit' and 'Cash Out'.*

### Warehouse Balance
*   **Source:** `useWarehouseQuery` API.
*   **Value:** `warehouseInfo.currentBalance`.
*   **Logic:** This is the "Source of Truth" balance stored in the database. It is updated by the backend whenever *any* valid transaction (Deposit, Cash Out, Payment, Payment Received) occurs.

---

## 5. Summary of Mathematical Operations

| Transaction Type | Effect on Petty Cash Summary | Effect on Main Warehouse Balance |
| :--- | :--- | :--- |
| **Deposit** | ➕ Adds to Balance | ➕ Adds to Balance |
| **Cash Out** | ➖ Subtracts from Balance | ➖ Subtracts from Balance |
| **Payment Received** | ⚪ No Effect (Ignored) | ➕ Adds to Balance |
| **Payment** | ⚪ No Effect (Ignored) | ➖ Subtracts from Balance |

**Why the difference?**
The **Petty Cash Summary** on the dashboard is designed to show the "net cash flow" specifically from direct deposits and withdrawals (Cash In/Out) for the selected period, whereas the **Warehouse Balance** reflects the total actual money the warehouse has, including all business payments and collections.

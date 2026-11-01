import yfinance as yf
import pandas as pd

# Your top 50 tickers (example set)
tickers = [
    "AAPL","MSFT","NVDA","AMZN","GOOGL","META","BRK-B","TSLA","LLY","AVGO",
    "JPM","UNH","XOM","V","MA","JNJ","PG","COST","HD","ABBV",
    "MRK","PEP","KO","ADBE","CRM","NFLX","CSCO","ORCL","INTC","AMD",
    "WMT","MCD","NKE","SBUX","TMO","ABT","QCOM","TXN","GS","MS",
    "AXP","BAC","WFC","CVX","T","VZ","DIS","GE","BA","MMM"
]

data = yf.download(
    tickers,
    start="2021-01-01",
    interval="1wk",
    group_by="ticker",
    auto_adjust=False
)

# Extract Open and Close only
result = []

for ticker in tickers:
    df = data[ticker][["Open", "Close"]].copy()
    df["Ticker"] = ticker
    df["Date"] = df.index
    result.append(df)

final_df = pd.concat(result)
final_df = final_df.reset_index(drop=True)

# Save to Excel
final_df.to_excel("sp500_weekly_prices.xlsx", index=False)

print("Done!")

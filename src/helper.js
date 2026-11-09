exports.ageLabel = (timestamp, now = Date.now()) => {
    if (!timestamp) return null;
    const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.round(minutes / 60)}h ago`;
};

exports.arbitrageNotAvailable = (currencyPair) => (
    {
        "arbitrage_not_available": {
            message: `Arbitrage not available for: ${currencyPair}`,
            currencyPair: currencyPair,
            transactions: [
                {
                    type: "BUY",
                    market: "NotAvailable",
                    pair: currencyPair,
                    price: ""
                },
                {
                    type: "SELL",
                    market: "NotAvailable",
                    pair: currencyPair,
                    price: ""
                }
            ],
            profitPerUnit: 0,
            profitPercentage: 0,
            date: null
        }
    }
)

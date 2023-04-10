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

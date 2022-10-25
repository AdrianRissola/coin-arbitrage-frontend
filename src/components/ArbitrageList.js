import Arbitrage from "./Arbitrage";

const tableStyleArbitrage = {
    borderRadius: "20px", 
    width: "400px", marginLeft: '2rem', 
    marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"#aaaaaa",
}

const satisfiedTickerFilter = (tickerFilter, pair) => {
  return (!tickerFilter || tickerFilter.toUpperCase()==="ALL" || tickerFilter.toUpperCase()===pair.toUpperCase())
}

const ArbitrageList = (props) => {
    const darkMode = props.darkMode
    const arbitrages = props.arbitrages
    const initArb = props.initArb
    const marketFilter = props.marketFilter
    const minProfitFilter = props.minProfitFilter
    const tickerFilter = props.tickerFilter
    const arbitrageComponents = []

    arbitrages.forEach((arbitrage) => {
        const marketPair = `${arbitrage.transactions[0].market}-${arbitrage.transactions[1].market}`
        if( (!marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase())) 
          && (!minProfitFilter || arbitrage.profitPercentage>=minProfitFilter)
          && satisfiedTickerFilter(tickerFilter, arbitrage.transactions[0].pair)
        )
        arbitrageComponents.push(
          <Arbitrage
            key={arbitrage.date}
            darkMode = {darkMode}
            header={`${arbitrage.transactions[0].pair}`}
            header2 = {`${arbitrage.date.slice(0,19).replace("T", " ")}`}
            arbitrage={arbitrage ? arbitrage : initArb[0]}
            tableStyle={tableStyleArbitrage}
          />
        )
    })
    return arbitrageComponents
}

export default ArbitrageList
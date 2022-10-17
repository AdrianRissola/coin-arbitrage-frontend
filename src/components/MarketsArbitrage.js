import Arbitrage from "./Arbitrage";

const tableStyleForBestArbitrage = {
    borderRadius: "40px", width: "400px", 
    marginLeft: '2rem', marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"green"
}

const tableStyleArbitrage = {
    borderRadius: "20px", 
    width: "400px", marginLeft: '2rem', 
    marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"#aaaaaa",
}

const MarketsArbitrage = (props) => {
    const darkMode = props.darkMode
    const arbitrages = props.arbitrages
    const ticker = props.ticker
    const initArb = props.initArb
    const marketFilter = props.marketFilter
    const minProfitFilter = props.minProfitFilter
    const marketPairs = Object.keys(arbitrages).sort()
    const arbitrageComponents = []
    arbitrageComponents.push(
      <Arbitrage
        key="Best Arbitrage"
        darkMode = {darkMode}
        header={"Best Arbitrage"}
        ticker={ticker}
        arbitrage={arbitrages[Object.keys(arbitrages)[0]]?arbitrages[Object.keys(arbitrages)[0]]:initArb[0]}
        tableStyle= {tableStyleForBestArbitrage}
      />
    )
    marketPairs.forEach((marketPair) => {
      if( (!marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase())) 
          && (!minProfitFilter || arbitrages[marketPair].profitPercentage>=minProfitFilter)
        )
        arbitrageComponents.push(
          <Arbitrage
            key={marketPair}
            darkMode = {darkMode}
            ticker={ticker}
            header={marketPair} 
            arbitrage={arbitrages[marketPair]?arbitrages[marketPair]:initArb[0]}
            tableStyle={tableStyleArbitrage}
          />
        )
    })
    return arbitrageComponents
}

export default MarketsArbitrage
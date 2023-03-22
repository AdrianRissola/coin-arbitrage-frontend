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
    const marketFilter = props.marketFilter
    const marketsFilter = props.marketsFilter
    const minProfitFilter = props.minProfitFilter
    const marketPairs = Object.keys(arbitrages).sort()
    const arbitrageComponents = []
    arbitrageComponents.push(
      <Arbitrage
        key="Best Arbitrage"
        darkMode = { darkMode }
        header={ "Best Arbitrage" }
        arbitrage={ arbitrages[Object.keys(arbitrages)[0]] }
        tableStyle= { tableStyleForBestArbitrage }
      />
    )
    marketPairs.forEach((marketPair) => {
      if(
          (!marketsFilter || (marketsFilter.includes(arbitrages[marketPair].transactions[0].market) && 
          marketsFilter.includes(arbitrages[marketPair].transactions[1].market))) &&
          (!marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase())) 
          && (!minProfitFilter || arbitrages[marketPair].profitPercentage>=minProfitFilter)
        )
        arbitrageComponents.push(
          <Arbitrage
            key={marketPair}
            darkMode = {darkMode}
            header={marketPair} 
            arbitrage={ arbitrages[marketPair] }
            tableStyle={tableStyleArbitrage}
          />
        )
    })
    return arbitrageComponents
}

export default MarketsArbitrage
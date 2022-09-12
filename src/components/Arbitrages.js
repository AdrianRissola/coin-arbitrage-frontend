import Arbitrage from "./Arbitrage";

const tableStyleForBestArbitrage = {
    borderRadius: "40px", width: "350px", 
    marginLeft: '2rem', marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"green"
}

const tableStyleArbitrage = {
    borderBottomRightRadius: "10px", 
    width: "350px", marginLeft: '2rem', 
    marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"#aaaaaa",
}

const Arbitrages = (props) => {
    const arbitrages = props.arbitrages
    const ticker = props.ticker
    const initArb = props.initArb
    const marketFilter = props.marketFilter
    const minProfitFilter = props.minProfitFilter
    const tables = []
    const marketPairs = Object.keys(arbitrages).sort()
    const arbitrageComponents = []
    arbitrageComponents.push(
      <Arbitrage
        header={"Best Arbitrage"}
        ticker={ticker}
        arbitrage={arbitrages[Object.keys(arbitrages)[0]]?arbitrages[Object.keys(arbitrages)[0]]:initArb[0]}
        tableStyle= {tableStyleForBestArbitrage}
      />
    )
    marketPairs.forEach((marketPair, index) => {
      if( (!marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase())) 
          && (!minProfitFilter || arbitrages[marketPair].profitPercentage>=minProfitFilter)
        )
        arbitrageComponents.push(
          <Arbitrage
            ticker={ticker}
            header={marketPair} 
            arbitrage={arbitrages[marketPair]?arbitrages[marketPair]:initArb[0]}
            tableStyle={tableStyleArbitrage}
          />
        )
    })
    for(let i=0 ; i<arbitrageComponents.length ; i+=3) {
      tables.push(
        <table key={i}>
          <tbody>
            <tr>
              <td align="center">
                {arbitrageComponents[i]}
              </td>
              {
                arbitrageComponents[i+1]?
                <td align="center">
                  {arbitrageComponents[i+1]}
                </td>
                :null
              }
              { 
                arbitrageComponents[i+2]?
                <td align="center">
                  {arbitrageComponents[i+2]}
                </td>
                :null
              }
            </tr>
          </tbody>
        </table>
      )
    }
    return tables
}

export default Arbitrages
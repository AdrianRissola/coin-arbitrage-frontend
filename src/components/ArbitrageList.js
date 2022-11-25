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

const getTime = (date) => (new Date(date)).getTime();

const ArbitrageList = (props) => {
    const darkMode = props.darkMode
    let arbitrages = props.arbitrages
    const initArb = props.initArb
    const marketFilter = props.marketFilter
    const minProfitFilter = props.minProfitFilter
    const tickerFilter = props.tickerFilter
    const orderBy = props.orderBy
    const withHeader = props.withHeader
    const arbitrageComponents = []

    if(marketFilter || (minProfitFilter && minProfitFilter>0) || (tickerFilter && tickerFilter!=="ALL"))
      arbitrages = arbitrages.filter(arbitrage => {
        const marketPair = `${arbitrage.transactions[0].market}-${arbitrage.transactions[1].market}`
        return (
          !marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase())) 
          && (!minProfitFilter || arbitrage.profitPercentage>=minProfitFilter)
          && satisfiedTickerFilter(tickerFilter, arbitrage.transactions[0].pair
        )
      })

    if(orderBy)
      arbitrages = arbitrages.sort((a, b) => {
        const [val1, val2] = (orderBy.key !== "date") 
          ? [a[orderBy.key], b[orderBy.key]] 
          : [getTime(a[orderBy.key]), getTime(new Date(b[orderBy.key]))];
        return orderBy.value === "DESC" ? val2 - val1 : val1 - val2;
      });
    
    arbitrages.forEach((arbitrage) => {
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
    
    let result = arbitrages;
    
    if(withHeader){
      result = (
        <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
          <div className="col-sm-12">
            <h3>Arbitrage: { arbitrageComponents.length }</h3>
          </div>
          <div className="row">
            { arbitrageComponents }
          </div>
        </div>
      )
    }

    return result
}

export default ArbitrageList
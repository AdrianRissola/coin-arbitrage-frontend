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
    const marketsFilter = props.marketsFilter
    const minProfitFilter = props.minProfitFilter
    const tickerFilter = props.tickerFilter
    const orderBy = props.orderBy
    const withHeader = props.withHeader
    const arbitrageComponents = []

    if(marketsFilter || marketFilter || (minProfitFilter && minProfitFilter>0) || (tickerFilter && tickerFilter!=="ALL"))
      arbitrages = arbitrages.filter(arbitrage => {
        const marketPair = `${arbitrage.transactions[0].market}-${arbitrage.transactions[1].market}`
        return (
          (!marketFilter || marketPair.toUpperCase().includes(marketFilter.toUpperCase()))
          && (!marketsFilter || (marketsFilter.includes(arbitrage.transactions[0].market) && marketsFilter.includes(arbitrage.transactions[1].market)))
          && (!minProfitFilter || arbitrage.profitPercentage>=minProfitFilter)
          && satisfiedTickerFilter(tickerFilter, arbitrage.transactions[0].pair)
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
            key={arbitrage._id}
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
          <div className="row" style={{justifyContent: "center"}}>
            <h3>Arbitrage Found: { arbitrageComponents.length }</h3>
            { arbitrageComponents }
          </div>
        </div>
      )
    }

    return result
}

export default ArbitrageList
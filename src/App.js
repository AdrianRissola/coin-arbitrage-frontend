import React, { useState } from "react";
import env from "react-dotenv";
import './App.scss';
import Arbitrage from "./components/Arbitrage";
import Arbitrage2 from "./components/Arbitrage2";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";

console.log("window.env: ", window.env)
console.log("env: ", env)
console.log("process.env: ", process.env)

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

const arbitragesTables = (ticker, arbitrages, initArb, marketFilter, minProfitFilter, arbitrageFilters) => {
  const tables = []
  const marketPairs = Object.keys(arbitrages).sort()
  const arbitrageComponents = []
  arbitrageComponents.push(
    <Arbitrage2
      key={0}
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
        <Arbitrage2
          key={index+1}
          ticker={ticker}
          header={marketPair} 
          arbitrage={arbitrages[marketPair]?arbitrages[marketPair]:initArb[0]}
          tableStyle={tableStyleArbitrage}
        />
      )
  })
  for(let i=0 ; i<arbitrageComponents.length ; i+=3) {
    tables.push(
      <table>
        <tbody>
          <tr>
            <td align="center" key={i}>
              {arbitrageComponents[i]}
            </td>
            {
              arbitrageComponents[i+1]?
              <td align="center" key={i+1}>
                {arbitrageComponents[i+1]}
              </td>
              :null
            }
            { 
              arbitrageComponents[i+2]?
              <td align="center" key={i+2}>
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

const tickerButtons = (tickers, HandleChangeTickerSubscriptionClick) => {
  return tickers.map(ticker=>{
    return (
      <button className="btn btn-dark" style={{marginRight: '1rem', width: "120px"}} onClick={()=>{HandleChangeTickerSubscriptionClick(ticker)}}>
        {ticker}
      </button>
    )
  })
}


const initArb = [
  {
    transactions: [
      {
        type: "BUY",
        market: null,
        pair: null,
        price: ""
      },
      {
        type: "SELL",
        market: null,
        pair: null,
        price: ""
      }
    ],
    profitPerUnit: 0,
    profitPercentage: 0,
    date: null
  }
]

const initMarketPrices = [
  {
    market: "",
    price: ""
  }
]

const allRequest = { 
  channel:"all",
  ticker:"btc-usdt"
};


let ws = null;
const App = () => {

  const [arbitrages, setArbitrages] = useState(initArb);
  const [marketPrices, setMarketPrices] = useState(initMarketPrices);
  const [ticker, setTicker] = useState("BTC-USDT")
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [tickerSubscription, setTickerSubscription] = useState("BTC-USDT")
  const [availableTickers, setAvailableTickers] = useState([])
  const [marketFilter, setMarketFilter] = useState()
  const [minProfitFilter, setMinProfitFilter] = useState()
  const [arbitrageFilters, setArbitrageFilters] = useState({
    markets:"",
    minProfit:0
  })

  const HandleChangeTickerSubscriptionClick = (tickerSubscriptionSelected) =>{
    if(tickerSubscription !== tickerSubscriptionSelected) {
      setTickerSubscription(tickerSubscriptionSelected);
      allRequest.ticker=tickerSubscriptionSelected
      ws.send(JSON.stringify(allRequest));
    }
  }
  
  if(!ws) {
    ws = new WebSocket(getWebsocketEndpoint());
  }



  ws.onopen = (event) => {
    ws.send(JSON.stringify(allRequest));
  };

  ws.onerror = (event) => {
    setArbitrageChannelMessage("Arbitrage service not available")
    setMarketPriceChannelMessage("Market prices service not available")
  } 

  ws.onmessage = function (event) {
    
    const response = JSON.parse(event.data);

    if(response.availableTickers) {
      if(!availableTickers || availableTickers.length===0) {
        setAvailableTickers(response.availableTickers)
      }
    }

    
    if(response.channel==='arbitrages') {
      if(response.arbitrages && Object.keys(response.arbitrages).length>0) {
        let ticker = Object.keys(response.arbitrages)[0]
        setTicker(ticker)
        setArbitrages(response.arbitrages[ticker])
        setArbitrageChannelMessage(null)
      } else {
        setArbitrages(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
    }

    if(response.channel==='prices') {
      if(!!response.marketPrices) {
        let ticker = Object.keys(response.marketPrices)[0]
        setMarketPrices(response.marketPrices[ticker])
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

  };



  return (
    <div className="container" style={{maxWidth: '1600px', marginTop: '25px'}}>   
      <table>
      <tbody>
          <tr> 
            <td>{ tickerButtons(availableTickers.filter(at=>{return at.split("-")[1]==="USDT"}), HandleChangeTickerSubscriptionClick) }</td>
          </tr>
          <tr> 
            <td>{ tickerButtons(availableTickers.filter(at=>{return at.split("-")[1]==="BTC"}), HandleChangeTickerSubscriptionClick) }</td>
          </tr>
        </tbody>
      </table>
      <header style={{fontWeight: 'bold', fontSize:"2.5rem", textAlign:"center"}}>{ticker} Arbitrage</header>

      <table>
        <tbody>
          <tr>
            <td>
              <div className="input-group mb-3" style={{width: '250px', marginLeft:'2rem'}}>
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">Markets</span>
                </div>
                <input 
                  className="form-control" 
                  id="markets" 
                  aria-describedby="basic-addon3" 
                  value={marketFilter}
                  onChange={evt => setMarketFilter(evt.target.value)}
                  // onChange={evt => {arbitrageFilters.markets=evt.target.value; setArbitrageFilters(arbitrageFilters)}}
                />
              </div>
            </td>
            <td>
              <div className="input-group mb-3" style={{width: '200px', marginLeft:'2rem'}}>
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">Min Profit %</span>
                </div>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={minProfitFilter}
                  onChange={evt => setMinProfitFilter(evt.target.value)}
                  // onChange={evt => {arbitrageFilters.minProfit=evt.target.value; setArbitrageFilters(arbitrageFilters)}}
                  className="form-control" 
                  id="minProfit" 
                  aria-describedby="basic-addon3"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <header style={{color:'red'}}>{arbitrageChannelMessage}</header>
      <header style={{color:'red'}}>{marketPriceChannelMessage}</header>
      <table>
        <tbody>
          <tr>
            <td> { arbitragesTables(ticker, arbitrages, initArb, marketFilter, minProfitFilter, arbitrageFilters) } </td>
            <td style={{verticalAlign:"top"}}>
              <MarketPrices ticker={ticker} marketPrices={marketPrices} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
};



export default App;
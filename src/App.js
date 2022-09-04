import React, { useImperativeHandle, useState } from "react";
import env from "react-dotenv";
import './App.scss';
import Arbitrage from "./components/Arbitrage";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";

console.log("window.env: ", window.env)
console.log("env: ", env)
console.log("process.env: ", process.env)

const tableStyleForBestArbitrage = {borderRadius: "40px", width: "300px", marginLeft: '2rem', borderStyle:'solid', borderColor:"green"}
const tableStyleArbitrage = {width: "300px", marginLeft: '2rem', marginRight: '-1rem', borderStyle:'solid', borderColor:"#aaaaaa"}

const arbitragesTables = (arbitrages, initArb) => {
  let tables = []
  let marketPairs = Object.keys(arbitrages).sort()
  for(let i=0 ; i<marketPairs.length-2 ; i+=3) {
    tables.push(
      <table>
        <tr>
          <td align="center">
            <Arbitrage
              header={marketPairs[i]} 
              arbitrage={arbitrages[marketPairs[i]]?arbitrages[marketPairs[i]]:initArb[0]}
              tableStyle={tableStyleArbitrage}
            />
          </td>
          <td align="center">
            <Arbitrage 
              header={marketPairs[i+1]}
              arbitrage={arbitrages[marketPairs[i+1]]?arbitrages[marketPairs[i+1]]:initArb[0]}
              tableStyle={tableStyleArbitrage}
            />
          </td>
          <td align="center">
            <Arbitrage 
              header={marketPairs[i+2]}
              arbitrage={arbitrages[marketPairs[i+2]]?arbitrages[marketPairs[i+2]]:initArb[0]}
              tableStyle={tableStyleArbitrage}
            />
          </td>
        </tr>
      </table>
    )
  }
  return tables
}

const tickerButtons = (tickers, HandleChangeTickerSubscriptionClick) => {
  return tickers.map(ticker=>{
    return (
      <td>
        <button class="btn btn-dark" style={{marginRight: '1rem', width: "120px"}} onClick={()=>{HandleChangeTickerSubscriptionClick(ticker)}} >{ticker}</button>
      </td>
    )
  })
}






let ws = null
const App = () => {

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

  const [arbitrages, setArbitrages] = useState(initArb);
  const [marketPrices, setMarketPrices] = useState(initMarketPrices);
  const [ticker, setTicker] = useState()
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [tickerSubscription, setTickerSubscription] = useState("BTC-USDT")
  const [availableTickers, setAvailableTickers] = useState([])

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

  const allRequest = { 
    channel:"all",
    ticker:"btc-usdt"
  };

  ws.onopen = (event) => {
    ws.send(JSON.stringify(allRequest));
  };

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
        <td> 
          <tr>{ tickerButtons(availableTickers.filter(at=>{return at.split("-")[1]==="USDT"}), HandleChangeTickerSubscriptionClick) } </tr>
          <tr>{ tickerButtons(availableTickers.filter(at=>{return at.split("-")[1]==="BTC"}), HandleChangeTickerSubscriptionClick) } </tr>
        </td>
      </table>
      <header style={{fontWeight: 'bold', fontSize:"2.5rem", textAlign:"center"}}>{ticker} Arbitrage</header>
      <header>{arbitrageChannelMessage}</header>
      <header>{marketPriceChannelMessage}</header>
      <table>
        <td> { arbitragesTables(arbitrages, initArb) } </td>
        <td style={{verticalAlign:"top"}}>
          <MarketPrices marketPrices={marketPrices} />
          <Arbitrage 
            header={"Best Arbitrage"}
            arbitrage={arbitrages[Object.keys(arbitrages)[0]]?arbitrages[Object.keys(arbitrages)[0]]:initArb[0]}
            tableStyle= {tableStyleForBestArbitrage}
          />
        </td>
      </table>
    </div>
  )
};



export default App;
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
    return <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick(ticker)}} >{ticker}</button>
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
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('BTC-USDT')}} >BTC-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('ETH-USDT')}} >ETH-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('ETH-BTC')}} >ETH-BTC</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('ADA-USDT')}} >ADA-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('SOL-USDT')}} >SOL-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('LTC-USDT')}} >LTC-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('XRP-USDT')}} >XRP-USDT</button>
      <button class="btn btn-dark" style={{marginRight: '1rem'}} onClick={()=>{HandleChangeTickerSubscriptionClick('DOGE-USDT')}} >DOGE-USDT</button>
      
      {/* { tickerButtons(["BTC-USDT","ETH-USDT"], HandleChangeTickerSubscriptionClick) } */}
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
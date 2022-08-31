import React, { useState } from "react";
import env from "react-dotenv";
import './App.scss';
import Arbitrage from "./components/Arbitrage";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";



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
          {/* <td align="center">
            <Arbitrage 
              header={marketPairs[i+3]}
              arbitrage={arbitrages[marketPairs[i+3]]?arbitrages[marketPairs[i+3]]:initArb[0]}
              tableStyle={tableStyleArbitrage}
            />
          </td> */}
        </tr>
      </table>
    )
  }
  return tables
}

let ws = null
const App = () => {

  // console.log("window.env: ", window.env)
  console.log("env: ", env)
  console.log("process.env: ", process.env)
  console.log("process.env.NODE_ENV : ", process.env.NODE_ENV )

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
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()

  
  if(!ws) {
    ws = new WebSocket(getWebsocketEndpoint());
  }
  
  // const arbitrageRequest = { 
  //   channel:"arbitrages",
  //   ticker:"btc-usdt"
  // };
  // const marketPricesRequest = { 
  //   channel:"prices",
  //   ticker:"btc-usdt"
  // };

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
      if(!!response.arbitrage) {
        setArbitrages(response.arbitrage)
      } else {
        setArbitrages(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
    }

    if(response.channel==='prices') {
      if(!!response.marketPrices && !!response.marketPrices.length>0) {
        setMarketPrices(response.marketPrices)
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

  };



  return (
    <div className="container" style={{maxWidth: '1600px'}}>
      <header style={{fontWeight: 'bold', fontSize:"2.5rem", textAlign:"center"}}>BTC-USDT Arbitrage</header>
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
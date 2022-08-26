import React, { useState } from "react";
import './App.css';
import Ticker from "./components/Ticker"




const App = () => {

  const init = {
    transactions: [
      {
        type: "BUY",
        market: null,
        pair: null,
        price: null
      },
      {
        type: "SELL",
        market: null,
        pair: null,
        price: null
      }
    ],
    profitPerUnit: 0,
    profitPercentage: 0,
    date: null
  }
  const [arbitrage, setArbitrage] = useState(init);

  const ws = new WebSocket("ws://localhost:3001");
  const request = { 
    channel:"arbitrages",
    ticker:"btc-usdt"
  };

  ws.onopen = (event) => {
    ws.send(JSON.stringify(request));
  };

  ws.onmessage = function (event) {

    console.log(`[message] Data received from server: ${JSON.stringify(event)}`);
    console.log(`${JSON.stringify(event.data)}`);
    
    const response = JSON.parse(event.data);

    console.log("response.arbitrage[0]: ", response.arbitrage);
    if(!!response.arbitrage && !!response.arbitrage[0]) {
      setArbitrage(response.arbitrage[0])
    } else {
      setArbitrage(prev=>prev)
    }



    
  };

  const displayedArbitrage = (arbitrage.transactions)?arbitrage:init
  return (
    <>
     <br/>
      <br/>
      <br/>
      <br/>
      <div className="App" style={{display:"flex","justify-content":"center","align-items":"center"}}>
        <table class="centered" >
          <tr align="center">
            <table class="center">
              <thead>
                <tr>
                  <th textAlign="center" colspan="3">BTC-USDT</th>
                </tr>
              </thead>
              
              <tr>
                <td align="center">Market</td>
                <td align="center">Operation</td>
                <td align="center">Price</td>
              </tr>
              <tr>             
                <td>{displayedArbitrage.transactions[0].market}</td>
                <td align="center">{displayedArbitrage.transactions[0].type}</td>
                <td>{displayedArbitrage.transactions[0].price}</td>
              </tr>
              <tr>
                <td>{displayedArbitrage.transactions[1].market}</td>
                <td align="center">{displayedArbitrage.transactions[1].type}</td>
                <td>{displayedArbitrage.transactions[1].price}</td>
              </tr>
            </table>
          </tr>
          <tr align="center">
            <table>
              <tr>
                <td align="center">Profit percentage</td>
                <td align="center">Profit per unit</td>
              </tr>
              <tr>
                <td align="center">{displayedArbitrage.profitPercentage.toFixed(3)}</td>
                <td align="center">{displayedArbitrage.profitPerUnit.toFixed(3)}</td>
              </tr>
            </table>
          </tr>
        </table>
      </div>
    </>
  )
};



export default App;
import React, { useState } from "react";
import env from "react-dotenv";
import './App.scss';
import Arbitrages from "./components/Arbitrages";
import TickerButtons from "./components/TickerButtons";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";

console.log("window.env: ", window.env)
console.log("env: ", env)
console.log("process.env: ", process.env)


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
  const [darkMode, setDarkMode] = useState(true)

  const HandleChangeTickerSubscriptionClick = (tickerSubscriptionSelected) =>{
    if(tickerSubscription !== tickerSubscriptionSelected) {
      setTickerSubscription(tickerSubscriptionSelected);
      allRequest.ticker=tickerSubscriptionSelected
      ws.send(JSON.stringify(allRequest));
    }
  }

  const FilterInput = (props) => {
    const label = props.label
    const inputType = props.inputType
    const value = props.value
    const onChange = props.onChange
    return(
      <div className="input-group mb-3" style={{width: '250px', marginLeft:'2rem'}}>
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon3">{label}</span>
        </div>
        <input
          input = {inputType}
          className = "form-control" 
          id = "markets" 
          aria-describedby = "basic-addon3" 
          value = {value}
          onChange = {onChange}
        />
      </div>
    )
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

      <div className="w-100 p-3 row" style={{backgroundColor: "#eee", margin: '10px', marginLeft: '10px', marginRight:'10px', flexWrap:'nowrap'}}>
        <TickerButtons 
          tickers={availableTickers.filter(at=>{return at.name.split("-")[1]==="BTC"})} 
          HandleChangeTickerSubscriptionClick={HandleChangeTickerSubscriptionClick}
          darkMode = {darkMode}
        >
        </TickerButtons>
      </div>
      <div className="w-100 p-3 row" style={{backgroundColor: "#eee", margin: '10px', marginLeft: '10px', marginRight:'10px', flexWrap:'nowrap'}}>
        <TickerButtons 
          tickers={availableTickers.filter(at=>{return at.name.split("-")[1]==="USDT"})} 
          HandleChangeTickerSubscriptionClick={HandleChangeTickerSubscriptionClick}
          darkMode = {darkMode}
        >
        </TickerButtons>
      </div>

      <div className="row">
          <div className="column">
            <header style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem", textAlign:"center"}}>{ticker} Arbitrage</header>
          </div>
          <div className="column">
            { darkMode?
              <button className="btn btn-light" onClick={()=>{setDarkMode(false)}}>
                <i className="fa fa-sun-o"></i> | Light
              </button>
              :
              <button className="btn btn-dark" onClick={()=>{setDarkMode(true)}}>
                <i className="fa fa-moon-o"></i> | Dark
              </button>
            }
          </div>
      </div>


      <div className="row">
        <div className="column">
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
            />
          </div>
        </div>
        <div className="column">
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
              className="form-control" 
              id="minProfit" 
              aria-describedby="basic-addon3"
            />
          </div>
        </div>
      </div>

      <header style={{color:'red'}}>{arbitrageChannelMessage}</header>
      <header style={{color:'red'}}>{marketPriceChannelMessage}</header>
      <div className="row">
        <div className="column"> 
          <Arbitrages
            ticker = {ticker}
            arbitrages = {arbitrages}
            initArb = {initArb}
            marketFilter = {marketFilter}
            minProfitFilter = {minProfitFilter}
            darkMode = {darkMode}
          >
          </Arbitrages>
        </div>
        <div className="column" style={{verticalAlign:"top"}}>
          <MarketPrices ticker={ticker} marketPrices={marketPrices} darkMode = {darkMode}/>
        </div>
      </div>
    </div>
  )
};



export default App;
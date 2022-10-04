import React, { useState } from "react";
import './App.scss';
import Arbitrages from "./components/Arbitrages";
import TickerButtons from "./components/TickerButtons";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";
import Arbitrage from "./components/Arbitrage";
import "./HorizontalScroll.css";
import helper from "./helper";


const allRequest = { 
  channel:"all",
  ticker:"btc-usdt"
};

const leftScroll = (id) => {
  const left = document.querySelector("#"+id);
  left.scrollBy(200, 0);
}

const rightScroll = (id) => {
  const right = document.querySelector("#"+id);
  right.scrollBy(-200, 0);
}

let ws = null;
const App = () => {

  const [arbitrages, setArbitrages] = useState(helper.initialArbitrage);
  const [bestArbitrage, setBestArbitrage] = useState(helper.initialArbitrage[0]);
  const [marketPrices, setMarketPrices] = useState(helper.initialMarketPrices);
  const [ticker, setTicker] = useState("BTC-USDT")
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [tickerSubscription, setTickerSubscription] = useState("BTC-USDT")
  const [availableTickers, setAvailableTickers] = useState([])
  const [marketFilter, setMarketFilter] = useState()
  const [minProfitFilter, setMinProfitFilter] = useState()
  const [darkMode, setDarkMode] = useState(true)
  const [currentWsResponse, setCurrentWsResponse] = useState({channel: null, ticker: null})

  const HandleChangeTickerSubscriptionClick = (tickerSubscriptionSelected) =>{
    if(tickerSubscription !== tickerSubscriptionSelected) {
      setTickerSubscription(tickerSubscriptionSelected);
      allRequest.ticker = tickerSubscriptionSelected
      allRequest.channel = tickerSubscriptionSelected==="ALL" ? "arbitrages" : "all";
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
    setArbitrageChannelMessage("Arbitrage service is not available")
    setMarketPriceChannelMessage("Market prices service is not available")
  } 

  ws.onmessage = function (event) {
    
    const response = JSON.parse(event.data);

    if(response.availableTickers) {
      if(!availableTickers || availableTickers.length===0) {
        setAvailableTickers(response.availableTickers)
      }
    }
     
    if(response.channel && response.ticker) {
      setCurrentWsResponse({channel: response.channel, ticker: response.ticker})
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

    if(response.channel==='arbitrages' && response.ticker==='ALL') {
      if(response.arbitrages && response.arbitrages.length>0) {
        setBestArbitrage(response.arbitrages[0])
        setTicker(response.arbitrages[0].transactions[0].pair)
        setArbitrageChannelMessage(null)
      } else {
        setBestArbitrage(prev=>prev)
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

      <div className="row">
        <div className="col-10">
          <div className="cover" >
            <button className="left" onClick={ ()=>{rightScroll("USDT")} } >
              <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
            </button>
            <div className="scroll-images" id="USDT">
              <TickerButtons 
                tickers={availableTickers.filter(at=>{return at.name.split("-")[1]==="USDT"})} 
                HandleChangeTickerSubscriptionClick={HandleChangeTickerSubscriptionClick}
                darkMode = {darkMode}
              >
              </TickerButtons>
            </div>
            <button className="right" onClick={ ()=>{leftScroll("USDT")} } 
              // onMouseOver = { (event)=>{leftScroll(event,"USDT")} }
              // onMouseOut = { (event)=>{leftScroll(event,"USDT")} }
              style={{marginRight: "-20px"}}
            >
              <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
            </button>
          </div>
        </div>
        <div className="col-2" >
          <div className="cover">
            <div className="scroll-images" id="ALL">
              <button className={darkMode ? "btn btn-dark" : "btn btn-light"}
                title={"Best arbitrage"}
                style={{marginRight: '0.3rem', marginTop: '0.3rem',  fontSize:'90%'}} 
                onClick={ ()=>{HandleChangeTickerSubscriptionClick("ALL")} }>
                {"BEST ARBITRAGE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    
      <div className="row">
        <div className="col-10">
          <div className="cover">
            <button className="left" onClick={ ()=>{rightScroll("BTC")} }>
              <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
            </button>
            <div className="scroll-images" id="BTC">
              <TickerButtons 
                tickers={availableTickers.filter(at=>{return at.name.split("-")[1]==="BTC"})} 
                HandleChangeTickerSubscriptionClick={HandleChangeTickerSubscriptionClick}
                darkMode = {darkMode}
              >
              </TickerButtons>
            </div>
            <button className="right" onClick={ ()=>{leftScroll("BTC")} } style={{marginRight: "-20px"}}>
              <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row">
          <div className="col" style={{textAlign: "center"}}>
            <span style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
              { tickerSubscription!=="ALL" ?
                <> {ticker} Arbitrage </>
                : <> Best Arbitrage </>
              }
            </span>
          </div>
      </div>

      <div className="row">
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
        {/* <div className="input-group mb-3" style={{width: '250px', marginLeft:'2rem'}}>
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon3">Best Arbitrage</span>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="check1" name="bestArbitrage" value="something"
              onClick={()=>{HandleChangeTickerSubscriptionClick("ALL")}}
              style={{marginTop:'0px', width: '38px', height: '38px'}}
            />
          </div>
        </div> */}

        <div className="col" style={{alignSelf: "center", marginRight:"50px"}}>
            { darkMode?
              <button className="btn btn-light" style={{float: "right"}} onClick={()=>{setDarkMode(false)}}>
                <i className="fa fa-sun-o" style={{fontSize:"38px", color:"yellow"}}></i> | Light
              </button>
              :
              <button className="btn btn-dark" style={{float: "right"}} onClick={()=>{setDarkMode(true)}}>
                <i className="fa fa-moon-o" style={{fontSize:"38px"}}></i> | Dark
              </button>
            }
          </div>
      </div>

      <span style={{color:'red'}}>{arbitrageChannelMessage}</span>
      <br/>
      <span style={{color:'red'}}>{marketPriceChannelMessage}</span>

      { tickerSubscription!=="ALL" && currentWsResponse.ticker!=="ALL" ?
        <div className="row">
          <div className="col-sm-9" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
            <Arbitrages
              ticker = {ticker}
              arbitrages = {arbitrages}
              initArb = {helper.initialArbitrage}
              marketFilter = {marketFilter}
              minProfitFilter = {minProfitFilter}
              darkMode = {darkMode}
            >
            </Arbitrages>
          </div>
          <div className="col-3" style={{verticalAlign:"top"}}>
            <MarketPrices ticker={ticker} marketPrices={marketPrices} darkMode = {darkMode}/>
          </div>
        </div>
        : 
        <div className="row">
          <div className="col-sm-9" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
            <Arbitrage
              darkMode = {darkMode}
              header={"Best Arbitrage: " + bestArbitrage.transactions[0].pair}
              ticker={ticker}
              arbitrage={bestArbitrage?bestArbitrage:helper.initialArbitrage[0]}
            />
          </div>
        </div>
      }
    </div>
  )
};



export default App;
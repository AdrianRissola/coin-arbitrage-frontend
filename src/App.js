import React, { useState } from "react";
import './App.scss';
import MarketsArbitrage from "./components/MarketsArbitrage";
import ArbitrageList from "./components/ArbitrageList";
import TickerButtons from "./components/TickerButtons";
import { getWebsocketEndpoint } from './params'
import MarketPrices from "./components/MarketPrices";
import Arbitrage from "./components/Arbitrage";
import "./HorizontalScroll.css";
import helper from "./helper";
import MarketStatus from "./components/MarketStatus";
import Navbar from "./components/Navbar";
import DarkModeButton from "./components/DarkModeButton";
import MarketFilter from "./components/filters/MarketFilter";
import MinProfitFilter from "./components/filters/MinProfitFilter";
import RowFilter from "./components/filters/RowFilter";
import ArbitrageView from "./components/views/ArbitrageView";
import BestArbitrageView from "./components/views/BestArbitrageView";
import HistoricalView from "./components/views/HistoricalView";
import MarketStatusView from "./components/views/MarketStatusView";
import ComboBoxFilter from "./components/filters/ComboBoxFilter";
import SplitButtonComboBox from "./components/filters/SplitButtonComboBox";


const allRequest = { 
  channel:"all",
  ticker:"btc-usdt"
};

let ws = null;
const App = () => {
  const arbitrageState = useState(helper.initialArbitrage);
  const [arbitrages, setArbitrages] = arbitrageState;
  const [bestArbitrage, setBestArbitrage] = useState(helper.initialArbitrage[0]);
  const [marketPrices, setMarketPrices] = useState(helper.initialMarketPrices);
  const [ticker, setTicker] = useState("BTC-USDT")
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [availableTickers, setAvailableTickers] = useState([])
  const [marketFilter, setMarketFilter] = useState("")
  const [minProfitFilter, setMinProfitFilter] = useState(0)
  const [darkMode, setDarkMode] = useState(true)
  const [currentWsResponse, setCurrentWsResponse] = useState({channel: null, ticker: null})
  const [historicalArbitrage, setHistoricalArbitrage] = useState(helper.initialArbitrage)
  const [marketStatus, setMarketStatus] = useState(null)
  const [tickerFilter, setTickerFilter] = useState("")
  const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "profitPercentage", value: "DESC", label: "Profit %"})


  const getArbitrageFilters = () => {
    return (
      [
        <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} />,
        <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} darkMode={darkMode} />,
      ]
    )
  }
  
  const handleSelectedTickerOnClick = (selectedTicker) => {
    if(tickerFilter!==selectedTicker) setTickerFilter(selectedTicker)
  }

  const handleSelectedHistoricalArbitrageOrderOnClick = (selectedHistoricalArbitrageOrder) => {
    if(selectedHistoricalArbitrageOrder.field) {
      if(historicalArbitrageOrder.field!==selectedHistoricalArbitrageOrder.field) 
        setHistoricalArbitrageOrder(selectedHistoricalArbitrageOrder)
      } else {
        setHistoricalArbitrageOrder(historicalArbitrageOrder)
      }
  }

  const handleSelectedHistoricalArbitrageOrderOnClickk = (selectedHistoricalArbitrageOrder) => {
    setHistoricalArbitrageOrder(selectedHistoricalArbitrageOrder)
  }

  const getTickersFromHistoricalArbitrageList = () => {
    const tickers = ["ALL"].concat(historicalArbitrage.map(arbitrage => {
      return(arbitrage.transactions[0].pair)
    }).sort())
    return [...new Set(tickers)];
  }

  const getHistoricalFilters = () => {
    const historicalFilters = getArbitrageFilters();
    historicalFilters.push(
      <ComboBoxFilter darkMode = { darkMode } onClickFunction = { handleSelectedTickerOnClick }
        currentSelection = { tickerFilter || "ALL" } buttonText = { "Ticker: "}
        options = { getTickersFromHistoricalArbitrageList() } styleWidth = {"175px"}
      />
    );
    historicalFilters.push(
      <SplitButtonComboBox darkMode = { darkMode } 
        optionOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClick }
        buttonOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClickk }
        currentSelection = { historicalArbitrageOrder } buttonText = { "Order By: "}
        options = { 
          [{key: "profitPercentage", value: "DESC", label: "Profit %"}, {key: "date", value: "DESC", label: "Date"}]
        }
        styleWidth = {"350px"} 
        // styleMarginLeft = {"-6rem"}
      />
    );
    return historicalFilters;
  }

  const getArbitrageRowFilterComponent = () => {
    return ( <RowFilter filters = { getArbitrageFilters() }/> )
  }

  const getHistoricalRowFilterComponent = () => {
    return ( <RowFilter filters = { getHistoricalFilters() }/> )
  }

  const getTickerButtonsComponent = (coin) => {
    return (
      <TickerButtons 
        tickers= { availableTickers.filter(at=>{return at.name.split("-")[1] === coin}) } 
        handleChangeChannelSubscriptionClick = { handleChangeChannelSubscriptionClick }
        darkMode = { darkMode }
      />
    )
  }

  const getTitle = () => {
    let title = currentWsResponse.channel;
    if(currentWsResponse.channel==='arbitrage' || currentWsResponse.channel==='prices') {
      title = currentWsResponse.ticker==='ALL' ? 'Best Arbitrage' : ticker + ' Arbitrage'
    }
    return title;
  }

  const getDivTitle = () => {
    return (
      <div className="row">
          <div className="col" style={{textAlign: "center"}}>
            <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
              { getTitle() }
            </h1>
          </div>
      </div>
    )
  }

  const isCurrentSubscription = (channelSubscription) => currentWsResponse.channel === channelSubscription.channel && currentWsResponse.ticker === channelSubscription.ticker

  const handleChangeChannelSubscriptionClick = (channelSubscription) => {
    if(!isCurrentSubscription(channelSubscription)) {
      ws.send(JSON.stringify(channelSubscription));
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
     
    if(response.channel && response.channel!=='prices') {
      setCurrentWsResponse({channel: response.channel, ticker: response.ticker})
    }
    
    if(response.channel==='arbitrage') {
      if(response.arbitrages && Object.keys(response.arbitrages).length>0) {
        const ticker = Object.keys(response.arbitrages)[0]
        setTicker(ticker)
        setArbitrages(response.arbitrages[ticker])
        setArbitrageChannelMessage(null)
      } else {
        setArbitrages(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
    }

    if(response.channel==='arbitrage' && response.ticker==='ALL') {
      if(response.arbitrages && response.arbitrages.length>0) {
        setBestArbitrage(response.arbitrages[0])
        setTicker(response.arbitrages[0].transactions[0].pair)
        setMarketStatus(response.marketStatus)
        setArbitrageChannelMessage(null)
      } else {
        setBestArbitrage(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
    }

    if(response.channel==='prices') {
      if(!!response.marketPrices) {
        const ticker = Object.keys(response.marketPrices)[0]
        setMarketPrices(response.marketPrices[ticker])
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

    // TODO: replace using API REST
    if(response.channel==='Historical') {
      if(!!response.arbitrages) {
        setHistoricalArbitrage(response.arbitrages)
      } else {
        setHistoricalArbitrage(prev=>prev)
      }
    }

    if(response.channel==='Markets') {
      if(response.markets) {
        setMarketStatus(response.markets)
      } else {
        setMarketStatus(prev=>prev)
      }
    }

  };



  return (
    
    <div style={{ backgroundColor: darkMode ? "#E9ECEF" : "white" }}>
      
      <Navbar darkMode = {darkMode} 
        brandFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'all', ticker:"btc-usdt"})} }
        arbitrageFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'all', ticker:"btc-usdt"})} }
        bestArbitrageFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker:"all"})} }
        historicalFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'Historical', ticker:"all"})} }
        marketsFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'Markets'})} }
        darkModeButton = { {component: DarkModeButton, darkMode: darkMode, darkModeSetFunction: setDarkMode} }
      />

      <span style={{color:'red'}}>{arbitrageChannelMessage}</span>
      <br/>
      <span style={{color:'red'}}>{marketPriceChannelMessage}</span>

      <div style={{ marginLeft:"1rem", marginRight:"1rem" }}>
        
        <ArbitrageView
          title = { getDivTitle() }
          currentWsResponse = { currentWsResponse }
          filters = { getArbitrageRowFilterComponent() }
          usdtTickerButtons = { getTickerButtonsComponent("USDT") }
          btcTickerButtons = { getTickerButtonsComponent("BTC") }
          marketsArbitrageComponent = {
            <MarketsArbitrage
              arbitrages = {arbitrages}
              initArb = {helper.initialArbitrage}
              marketFilter = {marketFilter}
              minProfitFilter = {minProfitFilter}
              darkMode = {darkMode}
            />
          }
          marketPrices = { <MarketPrices ticker={ticker} marketPrices={marketPrices} darkMode = {darkMode}/> }
        />

        <BestArbitrageView
          title = { getDivTitle() }
          currentWsResponse = { currentWsResponse }
          arbitrageComponent = {
            <Arbitrage
              darkMode = {darkMode}
              header = { "Best Arbitrage: " + bestArbitrage.transactions[0].pair }
              arbitrage = { bestArbitrage?bestArbitrage:helper.initialArbitrage[0] }
            />
          }
          marketStatusComponent = { <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/> }
        />

        <HistoricalView
          title = { getDivTitle() }
          currentWsResponse = { currentWsResponse }
          filters = { getHistoricalRowFilterComponent() }
          arbitrageListComponent = {
            <ArbitrageList
              arbitrages = { historicalArbitrage }
              initArb = { helper.initialArbitrage }
              marketFilter = { marketFilter }
              minProfitFilter = { minProfitFilter }
              tickerFilter = { tickerFilter }
              darkMode = { darkMode }
              orderBy = { historicalArbitrageOrder }
              withHeader = { true }
            />
          }
        />

        <MarketStatusView
          currentWsResponse = { currentWsResponse }
          title = { getDivTitle() }
          marketStatusComponent = { <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/> }
        />

      </div>
    </div>
  )
};

export default App;
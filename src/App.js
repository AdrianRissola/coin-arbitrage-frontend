import React, { useState } from "react";
import './App.scss';
import { getWebsocketEndpoint } from './params'
import helper from "./helper";
import Navbar from "./components/Navbar";
import DarkModeButton from "./components/DarkModeButton";
import { buildArbitrageView, buildHistoricalView, buildMarketStatusView, buildBestArbitrageView } from "./components/views/ViewBuilder";

console.log(process.env);

let ws = null;

const App = () => {
  const [arbitrages, setArbitrages] = useState(helper.initialArbitrage);
  const [bestArbitrage, setBestArbitrage] = useState(helper.initialArbitrage[0]);
  const [marketPrices, setMarketPrices] = useState(helper.initialMarketPrices);
  const [ticker, setTicker] = useState("BTC-USDT")
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [availableTickers, setAvailableTickers] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [currentWsResponse, setCurrentWsResponse] = useState({channel: "arbitrage", ticker: "btc-usdt"})
  const [marketStatus, setMarketStatus] = useState(null)
  const [webSocketOnMessageEnabled, setWebSocketOnMessageEnabled] = useState(true)
  const [menuSelection, setMenuSelection] = useState('arbitrage');
  const [webSocketRequest, setWebSocketRequest] = useState({ channel:"arbitrage", ticker:"btc-usdt" });

  const isCurrentSubscription = (channelSubscription) => currentWsResponse.channel === channelSubscription.channel && currentWsResponse.ticker === channelSubscription.ticker
  const isOpen = ws => ws.readyState === ws.OPEN
  const isClosed = ws => ws.readyState === ws.CLOSED

  const handleChangeChannelSubscriptionClick = (channelSubscription) => {
    setWebSocketOnMessageEnabled(true);
    setWebSocketRequest(channelSubscription);
    if(isClosed(ws)) {
      ws = new WebSocket(getWebsocketEndpoint());
    } else if(!isCurrentSubscription(channelSubscription) && isOpen(ws)) {
      ws.send(JSON.stringify(channelSubscription));
    }
  }
  
  if(!ws) {
    ws = new WebSocket(getWebsocketEndpoint());
  }

  ws.onopen = (event) => {
    if(isOpen(ws))
      ws.send(JSON.stringify(webSocketRequest));
  };

  ws.onerror = (event) => {
    setArbitrageChannelMessage("Arbitrage service is not available")
    setMarketPriceChannelMessage("Market prices service is not available")
  } 

  ws.onmessage = function (event) {

    if(!webSocketOnMessageEnabled) return;
    
    const response = JSON.parse(event.data);

    if(response.availableTickers) {
      if(!availableTickers || availableTickers.length===0) {
        setAvailableTickers(response.availableTickers)
      }
    }

    if(menuSelection!==response.channel) return;
     
    if(response?.channel!=='prices') {
      setCurrentWsResponse({channel: response.channel, ticker: response.ticker})
    }
    
    if(response.channel==='arbitrage' && response.ticker===webSocketRequest.ticker) {
      if(response.arbitrages && Object.keys(response.arbitrages).length>0) {
        const ticker = Object.keys(response.arbitrages)[0]
        setTicker(ticker)
        setArbitrages(response.arbitrages[ticker])
        setArbitrageChannelMessage(null)
      } else {
        setArbitrages(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
      if(response.marketPrices) {
        const ticker = Object.keys(response.marketPrices)[0];
        setMarketPrices(response.marketPrices[ticker]
          .sort((mp1, mp2) => (mp1.market > mp2.market) ? 1 : ((mp2.market > mp1.market) ? -1 : 0)));
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

    if(response.channel==='bestArbitrage' && response.ticker==='ALL') {
      if(response.arbitrages && response.arbitrages.length>0) {
        setBestArbitrage(response.arbitrages[0])
        setTicker(response.arbitrages[0].transactions[0].pair)
        setMarketStatus(response.marketStatus)
        setArbitrageChannelMessage(null)
      } else {
        setBestArbitrage(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
      if(response.marketPrices) {
        const ticker = Object.keys(response.marketPrices)[0]
        setMarketPrices(response.marketPrices[ticker])
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

    if(response.channel==='markets') {
      if(response.markets) {
        setMarketStatus(response.markets)
      } else {
        setMarketStatus(prev=>prev)
      }
    }

  };

  const menuSelector = Object.freeze({
    arbitrage : () => {return buildArbitrageView(
      {darkMode, ticker, availableTickers, arbitrages, handleChangeChannelSubscriptionClick, marketPrices })},
    bestArbitrage : () => {return buildBestArbitrageView({darkMode, bestArbitrage, marketPrices, marketStatus})},
    historical: () => {return buildHistoricalView(darkMode)},
    markets: () => {return buildMarketStatusView(darkMode, marketStatus)}
  })

  // const menuSelector = Object.freeze({
  //   arbitrage : buildArbitrageView(
  //     {darkMode, ticker, availableTickers, arbitrages, handleChangeChannelSubscriptionClick, marketPrices }),
  //   bestArbitrage : buildBestArbitrageView({darkMode, bestArbitrage, marketPrices, marketStatus}),
  //   historical: buildHistoricalView(darkMode),
  //   markets: ()=>{return buildMarketStatusView(darkMode, marketStatus)}
  // })

  return (
    
    <div style={{ backgroundColor: darkMode ? "#E9ECEF" : "white" }}>
      
      <Navbar darkMode = {darkMode}
        brandFunction = { ()=>{
          setMenuSelection('arbitrage');
          handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker:"btc-usdt"})} }
        arbitrageFunction = { ()=>{
          setMenuSelection('arbitrage');
          handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker:"btc-usdt"})} }
        bestArbitrageFunction = { ()=>{
          setMenuSelection('bestArbitrage');
          handleChangeChannelSubscriptionClick({channel: 'bestArbitrage', ticker:"all"})} }
        historicalFunction = { ()=>{
          setMenuSelection('historical');
          setWebSocketOnMessageEnabled(false);
          setCurrentWsResponse({channel: null, ticker: null})} }
        marketsFunction = { ()=>{
          setMenuSelection('markets');
          handleChangeChannelSubscriptionClick({channel: 'Markets'})} }
        darkModeButton = { {component: DarkModeButton, darkMode: darkMode, darkModeSetFunction: setDarkMode} }
      />
      
      <span style={{color:'red'}}>{arbitrageChannelMessage}</span>
      <br/>
      <span style={{color:'red'}}>{marketPriceChannelMessage}</span>

      <div style={{ marginLeft:"1rem", marginRight:"1rem" }}>

        { menuSelector[currentWsResponse.channel || menuSelection]() }

      </div>
    </div>
  )
};

export default App;
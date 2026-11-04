import React, { useState, useRef, useEffect } from "react";
import './App.scss';
import { getWebsocketEndpoint } from './params'
import helper from "./helper";
import Navbar from "./components/Navbar";
import DarkModeButton from "./components/DarkModeButton";
import { buildArbitrageView, buildHistoricalView, buildMarketStatusView, buildBestArbitrageView } from "./components/views/ViewBuilder";
import { useSnackbar } from 'notistack'

const wsReadyState = Object.freeze({
  0: {status: "CONNECTING", variant: "info"},
  1: {status: "OPEN", variant: "success"},
  2: {status: "CLOSING", variant: "warning"},
  3: {status: "CLOSED", variant: "error"},
}) 


const App = () => {
  const [ws, setWs] = useState(null);
  const [socketGeneration, setSocketGeneration] = useState(0);
  const socketRef = useRef(null);
  const currentWsStatus = useRef(-1);
  const {enqueueSnackbar} = useSnackbar();
  const socketReadyState = ws?.readyState;

  useEffect(() => {
    if (ws && socketRef.current === ws && socketReadyState === ws.CLOSED)
      setSocketGeneration(generation => generation + 1);
  }, [ws, socketReadyState]);

  const [arbitrages, setArbitrages] = useState(helper.initialArbitrage);
  const [bestArbitrage, setBestArbitrage] = useState(helper.initialArbitrage);
  const [marketPrices, setMarketPrices] = useState(null);
  const [ticker, setTicker] = useState("BTC-USDT")
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState()
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState()
  const [darkMode, setDarkMode] = useState(true)
  const [currentWsResponse, setCurrentWsResponse] = useState({channel: "arbitrage", ticker: "BTC-USDT"})
  const [marketStatus, setMarketStatus] = useState(null)
  const [webSocketOnMessageEnabled, setWebSocketOnMessageEnabled] = useState(true)
  const [menuSelection, setMenuSelection] = useState('arbitrage');
  const [webSocketRequest, setWebSocketRequest] = useState({ channel:"arbitrage", ticker:"BTC-USDT" });
  const streamState = useRef(null);

  useEffect(() => {
    streamState.current = {webSocketRequest, webSocketOnMessageEnabled, menuSelection};
  }, [webSocketRequest, webSocketOnMessageEnabled, menuSelection]);

  const isCurrentSubscription = (channelSubscription) => currentWsResponse.channel === channelSubscription.channel && currentWsResponse.ticker === channelSubscription.ticker
  
  // const isConnecting = ws => ws.readyState === ws.CONNECTING
  const isOpen = ws => ws.readyState === ws.OPEN
  // const isClosing = ws => ws.readyState === ws.CLOSING
  const isClosed = ws => ws.readyState === ws.CLOSED


  const handleChangeChannelSubscriptionClick = (channelSubscription) => {
    setWebSocketOnMessageEnabled(true);
    setWebSocketRequest(channelSubscription);
    if(ws && isClosed(ws)) {
      setSocketGeneration(generation => generation + 1);
    } else if(ws && !isCurrentSubscription(channelSubscription) && isOpen(ws)) {
      ws.send(JSON.stringify(channelSubscription));
    }
  }

  useEffect(() => {
  const ws = new WebSocket(getWebsocketEndpoint());
  socketRef.current = ws;
  setWs(ws);
  ws.onopen = (event) => {
    if(socketRef.current === ws && ws.readyState === ws.OPEN)
      ws.send(JSON.stringify(streamState.current.webSocketRequest));
  };

  ws.onerror = (event) => {
    if(socketRef.current !== ws) return;
    setArbitrageChannelMessage("Arbitrage service is not available")
    setMarketPriceChannelMessage("Market prices service is not available")
  } 

  ws.onmessage = function (event) {
    const {webSocketRequest, webSocketOnMessageEnabled, menuSelection} = streamState.current;
    if(socketRef.current !== ws || !webSocketOnMessageEnabled) return;
    
    const response = JSON.parse(event.data);

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
        setTicker(webSocketRequest.ticker)
        setArbitrages(helper.arbitrageNotAvailable(webSocketRequest.ticker))
      }
      if(response.marketPrices) {
        const ticker = Object.keys(response.marketPrices)[0];
        if(response.marketPrices[ticker]) {
          setMarketPrices(
            [
              response.marketPrices[ticker].sort((mp1, mp2) => (mp1.market > mp2.market) ? 1 : ((mp2.market > mp1.market) ? -1 : 0))
            ]
          );
          setMarketPriceChannelMessage(null);
        }
      } else {
        setMarketPrices(prev=>prev)
        setMarketPriceChannelMessage(response.message)
      }
    }

    if(response.channel==='bestArbitrage' && response.ticker==='ALL') {
      const arbitrages = response.bestArbitrages.arbitragesData.map( ad => ad.arbitrage );
      const marketPrices = {};
      response.bestArbitrages.arbitragesData.forEach(ad => {
        marketPrices[Object.keys(ad.marketPrices)[0]] = ad.marketPrices[Object.keys(ad.marketPrices)[0]];
      });
      if(response.bestArbitrages.arbitragesData) {
        setBestArbitrage(arbitrages);
        setArbitrageChannelMessage(null)
      } else {
        setBestArbitrage(prev=>prev)
        setArbitrageChannelMessage(response.message)
      }
      if(response.bestArbitrages.arbitragesData) {
        setMarketPrices(marketPrices);
        setMarketPriceChannelMessage(null);
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
  return () => {
    socketRef.current = null;
    ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
    if(ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN) ws.close();
  };
  }, [socketGeneration]);
  
  useEffect(() => {
    if(!ws || socketRef.current !== ws || socketReadyState === ws.CLOSED) return;
    if(currentWsStatus.current!==socketReadyState) {
      const currentWsReadyState = wsReadyState[socketReadyState]
      enqueueSnackbar(
        "WebSocket status: " + currentWsReadyState.status,
        { autoHideDuration: 5000, variant: currentWsReadyState.variant }
      )
      currentWsStatus.current = socketReadyState;
    }
  }, [enqueueSnackbar, ws, socketReadyState]);

  const menuSelector = Object.freeze({
    arbitrage : () => {return buildArbitrageView(
      {darkMode, ticker, arbitrages, handleChangeChannelSubscriptionClick, marketPrices })},
    bestArbitrage : () => {return buildBestArbitrageView({darkMode, bestArbitrage, marketPrices, marketStatus})},
    historical: () => {return buildHistoricalView(darkMode)},
    markets: () => {return buildMarketStatusView(darkMode, marketStatus)}
  })

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
      
      { arbitrageChannelMessage ? 
        <>
          <span style={{color:'red', padding:'10px'}}>{arbitrageChannelMessage}</span>
          <br/>
        </>
        : null
      }
      { marketPriceChannelMessage? 
        <span style={{color:'red', padding:'10px'}}>{marketPriceChannelMessage}</span> 
        : null
      }

      <div style={{ marginLeft:"1rem", marginRight:"1rem" }}>

        { menuSelector[currentWsResponse.channel || menuSelection]() }

      </div>
      
    </div>
  )
};

export default App;
import React, { useState } from "react";
import './App.scss';
import MarketsArbitrage from "./components/MarketsArbitrage";
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



let ws = null;

console.log(process.env);
const App = () => {
  const arbitrageState = useState(helper.initialArbitrage);
  const [arbitrages, setArbitrages] = arbitrageState;
  const [bestArbitrage, setBestArbitrage] = useState(helper.initialArbitrage[0]);
  const [marketPrices, setMarketPrices] = useState(helper.initialMarketPrices);
  const [ticker, setTicker] = useState("BTC-USDT");
  const [arbitrageChannelMessage, setArbitrageChannelMessage] = useState();
  const [marketPriceChannelMessage, setMarketPriceChannelMessage] = useState();
  const [availableTickers, setAvailableTickers] = useState([]);
  const [marketFilter, setMarketFilter] = useState("");
  const [minProfitFilter, setMinProfitFilter] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [currentWsResponse, setCurrentWsResponse] = useState({channel: null, ticker: null});
  // const [wsEnabled, setWsEnabled] = useState(true);
  const [historicalArbitrage, setHistoricalArbitrage] = useState(helper.initialArbitrage);
  const [marketStatus, setMarketStatus] = useState(null);
  const [tickerFilter, setTickerFilter] = useState("");
  const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "profitPercentage", value: "DESC", label: "Profit %"});
  const [menuSelection, setMenuSelection] = useState({
    websocketSelected: true,
    channelSubscription: {channel: 'arbitrage', ticker:"btc-usdt"}
  });



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
    let title = "";
    if(currentWsResponse) {
      title = currentWsResponse.channel;
      if(currentWsResponse.channel==='arbitrage' || currentWsResponse.channel==='prices') {
        title = currentWsResponse.ticker==='ALL' ? 'Best Arbitrage' : ticker + ' Arbitrage'
      }
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


  const isOpen = ws => ws.readyState === ws.OPEN


  
  if(!ws) {
    ws = new WebSocket(getWebsocketEndpoint());
  }

  ws.onopen = (event) => {
    if(isOpen(ws))
      ws.send(JSON.stringify({ 
        channel:"arbitrage",
        ticker:"btc-usdt"
      }));
  };

  ws.onerror = (event) => {
    setArbitrageChannelMessage("Arbitrage service is not available")
    setMarketPriceChannelMessage("Market prices service is not available")
  } 

  ws.onmessage = function (event) {

    if(menuSelection.websocketSelected) {

      const response = JSON.parse(event.data);

      if(response.availableTickers) {
        if(!availableTickers || availableTickers.length===0) {
          setAvailableTickers(response.availableTickers);
        }
      }
       
      if(response.channel && response.channel!=='prices') {
        // setCurrentWsResponse({channel: response.channel, ticker: response.ticker});
        console.log('response: ', response);
        setMenuSelection({
          websocketSelected: true,
          channelSubscription: {channel: response.channel, ticker: response.ticker}
        });
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
        if(response.marketPrices) {
          const ticker = Object.keys(response.marketPrices)[0]
          setMarketPrices(response.marketPrices[ticker])
        } else {
          setMarketPrices(prev=>prev)
          setMarketPriceChannelMessage(response.message)
        }
      }
  
      if(response.channel==='arbitrage' && response.ticker==='ALL') {
        if(response.arbitrages && response.arbitrages.length>0) {
          setBestArbitrage(response.arbitrages[0]);
          setTicker(response.arbitrages[0].transactions[0].pair);
          setMarketStatus(response.marketStatus);
          setArbitrageChannelMessage(null);
        } else {
          setBestArbitrage(prev=>prev);
          setArbitrageChannelMessage(response.message);
        }
        if(response.marketPrices) {
          const ticker = Object.keys(response.marketPrices)[0];
          setMarketPrices(response.marketPrices[ticker]);
        } else {
          setMarketPrices(prev=>prev);
          setMarketPriceChannelMessage(response.message);
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

    }
  };

  const isCurrentSubscription = (channelSubscription) => currentWsResponse.channel === channelSubscription.channel && currentWsResponse.ticker === channelSubscription.ticker


  const handleChangeChannelSubscriptionClick = (channelSubscription) => {
    if(!isCurrentSubscription(channelSubscription) && isOpen(ws)) {
      ws.send(JSON.stringify(channelSubscription));
    }
  }

  const handleMenuSelectionClick = (selection) => {
    
    if(selection.websocketSelected){
      setMenuSelection({websocketSelected: true});      
      if(!isCurrentSubscription(selection.channelSubscription) && isOpen(ws)) {
        ws.send(JSON.stringify(selection.channelSubscription));
      }
    } else {
      selection.websocketSelected = false
      setMenuSelection(selection);
    }
  }

  return (
    
    <div style={{ backgroundColor: darkMode ? "#E9ECEF" : "white" }}>
      
      <Navbar darkMode = {darkMode}
        brandFunction = { ()=>{
          handleMenuSelectionClick({
            websocketSelected: true,
            selection: 'arbitrage',
            channelSubscription: {channel: 'arbitrage', ticker:"btc-usdt"}
          });
        }}
        arbitrageFunction = { ()=>{
          handleMenuSelectionClick({
              websocketSelected: true,
              selection: 'arbitrage',
              channelSubscription: {channel: 'arbitrage', ticker:"btc-usdt"}
            });
          //handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker:"btc-usdt"})
        } }
        bestArbitrageFunction = { ()=>{
          handleMenuSelectionClick({
            websocketSelected: true,
            bestArbitrageViewEnabled: true,
            channelSubscription: {channel: 'arbitrage', ticker:"all"}
          });
          // handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker:"all"})
        } }
        // historicalFunction = { ()=>{handleChangeChannelSubscriptionClick({channel: 'Historical', ticker:"all"})} }
        historicalFunction = { ()=>{
          handleMenuSelectionClick({historicalViewEnabled: true});
          //setArbitrageViewEnabled(true); setWsEnabled(false); setCurrentWsResponse(null); 
        } }
        marketsFunction = { ()=>{
          handleMenuSelectionClick({
            websocketSelected: true,
            channelSubscription: {channel: 'Markets'}
          });
        }}
          // handleChangeChannelSubscriptionClick({channel: 'Markets'})} 
        darkModeButton = { {component: DarkModeButton, darkMode: darkMode, darkModeSetFunction: setDarkMode} }
      />

      <span style={{color:'red'}}>{arbitrageChannelMessage}</span>
      <br/>
      <span style={{color:'red'}}>{marketPriceChannelMessage}</span>

      <div style={{ marginLeft:"1rem", marginRight:"1rem" }}>
        

        { menuSelection?.channelSubscription?.channel?.toUpperCase()==="ARBITRAGE" 
                && menuSelection.channelSubscription.ticker.toUpperCase()!=="ALL" ?
          <ArbitrageView
            title = { getDivTitle() }
            menuSelection = { menuSelection }
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
          : null
        }

        { menuSelection.channelSubscription?.ticker?.toUpperCase() === "ALL" ?
          <BestArbitrageView
            title = { getDivTitle() }
            menuSelection = { menuSelection }
            // currentWsResponse = { currentWsResponse }
            arbitrageComponent = {
              <Arbitrage
                darkMode = {darkMode}
                header = { "Best Arbitrage: " + bestArbitrage.transactions[0].pair }
                arbitrage = { bestArbitrage ? bestArbitrage : helper.initialArbitrage[0] }
              />
            }
            marketPrices = { 
              <MarketPrices ticker={bestArbitrage.transactions[0].pair} 
                marketPrices={marketPrices} darkMode = {darkMode}
              /> 
            }
            marketStatusComponent = { <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/> }
          />
          : null
        }

        <HistoricalView
          title = { getDivTitle() }
          menuSelection = { menuSelection }
          filters = { getHistoricalRowFilterComponent() }
          marketFilter = { marketFilter }
          minProfitFilter = { minProfitFilter }
          tickerFilter = { tickerFilter }
          darkMode = { darkMode }
          orderBy = { historicalArbitrageOrder }
        />

        { menuSelection?.channelSubscription?.channel?.toUpperCase()==="MARKETS" ?
          <MarketStatusView
            menuSelection = { menuSelection }
            // currentWsResponse = { currentWsResponse }
            darkMode = { darkMode }
            title = { getDivTitle() }
            marketStatusComponent = { <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/> }
          />
          : null
        }

      </div>
    </div>
  )
};

export default App;
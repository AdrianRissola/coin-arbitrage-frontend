import React, { useState } from "react";
import MarketFilter from "../filters/MarketFilter";
import MarketPrices from "../MarketPrices";
import MinProfitFilter from "../filters/MinProfitFilter";
import RowFilter from "../filters/RowFilter";
import TickerButtons from "../TickerButtons";
import MarketsArbitrage from "../MarketsArbitrage";
import helper from "../../helper";
import "../../HorizontalScroll.css";


const leftScroll = (id) => {
    const left = document.querySelector("#"+id);
    left.scrollBy(200, 0);
}
  
const rightScroll = (id) => {
    const right = document.querySelector("#"+id);
    right.scrollBy(-200, 0);
}

const ArbitrageView = (props)=> {
    const [marketFilter, setMarketFilter] = useState("");
    const [minProfitFilter, setMinProfitFilter] = useState(0);
    const ticker = props.ticker;
    const handleChangeChannelSubscriptionClick = props.handleChangeChannelSubscriptionClick;
    const availableTickers = props.availableTickers;
    const arbitrages = props.arbitrages;
    const marketPrices = props.marketPrices;
    const darkMode = props.darkMode;

    const getTickerButtonsComponent = (coin) => {
        return (
          <TickerButtons 
            tickers = { availableTickers.filter(at=>{return at.name.split("-")[1] === coin}) } 
            handleChangeChannelSubscriptionClick = { handleChangeChannelSubscriptionClick }
            darkMode = { darkMode }
          />
        )  
    }

    const getArbitrageFilters = () => {
        return (
          [
            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} />,
            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} darkMode={darkMode} />,
          ]
        )  
    }

    return(
        <>
            <div className="row">
                <div className="col-10">
                    <div className="cover" >
                        <button className="left" onClick={ ()=>{rightScroll("USDT")} } >
                            <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                        </button>
                        <div className="scroll-images" id="USDT">
                            { getTickerButtonsComponent("USDT") }
                        </div>
                        <button className="right" onClick={ ()=>{leftScroll("USDT")} } 
                            style={{marginRight: "-20px"}}
                        >
                            <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                        </button>
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
                            { getTickerButtonsComponent("BTC") }
                        </div>
                        <button className="right" onClick={ ()=>{leftScroll("BTC")} } style={{marginRight: "-20px"}}>
                            <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        { ticker } Arbitrage
                    </h1>
                </div>
            </div>
            <RowFilter filters = { getArbitrageFilters() }/>
            <div className="row">
                <div className="col-sm-9" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
                    <MarketsArbitrage
                        arbitrages = {arbitrages}
                        initArb = {helper.initialArbitrage}
                        marketFilter = {marketFilter}
                        minProfitFilter = {minProfitFilter}
                        darkMode = {darkMode}
                    />
                </div>
                <div className="col-3" style={{verticalAlign:"top"}}>
                    <MarketPrices ticker={ticker} marketPrices={marketPrices} darkMode = {darkMode}/>
                </div>
            </div>
        </>
    )
}

export default ArbitrageView
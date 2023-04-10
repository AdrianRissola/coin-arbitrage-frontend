import React, { useState } from "react";
import MarketFilter from "../filters/MarketFilter";
import MarketPrices from "../MarketPrices";
import MinProfitFilter from "../filters/MinProfitFilter";
import RowFilter from "../filters/RowFilter";
import TickerButtons from "../TickerButtons";
import MarketsArbitrage from "../MarketsArbitrage";
import "../../HorizontalScroll.css";
import MarketsComboBoxFilter from "../filters/MarketsCheckboxDropdownFilter";



const leftScroll = (id) => {
    const left = document.querySelector("#"+id.concat('scroll'));
    left?.scrollBy(200, 0);
}
  
const rightScroll = (id) => {
    const right = document.querySelector("#"+id.concat('scroll'));
    right?.scrollBy(-200, 0);
}

const ArbitrageView = (props)=> {
    const [marketFilter, setMarketFilter] = useState("");
    const [marketsFilter, setMarketsFilter] = useState([]);
    const [minProfitFilter, setMinProfitFilter] = useState(0); 
    const [coin, setCoin]  = useState("USDT");
    const ticker = props.ticker;
    const handleChangeChannelSubscriptionClick = props.handleChangeChannelSubscriptionClick;
    const pairCurrencies = props.availableTickers;
    const arbitrages = props.arbitrages;
    const marketPrices = props.marketPrices;
    const darkMode = props.darkMode;
    const btnGroupClassName = darkMode ? "btn btn-dark" : "btn btn-light";

    const quoteCurrencies = Array.from(new Set(pairCurrencies.map(bc => bc.name.split('-')[1]))).sort();

    const getTickerButtonsComponent = (coin) => {
        return (
          <TickerButtons
            tickers = { pairCurrencies.filter(at=>{return at.name.split("-")[1] === coin}) } 
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
            <MarketsComboBoxFilter darkMode = { darkMode } onClickFunction = { setMarketsFilter }
                marketsFilter = { marketsFilter } buttonText = { "Markets"} styleWidth = {"100px"}
            />
          ]
        )  
    }

    return(
        <>
            <div className="row" style={{ textAlign: "center" }}>
                <div className="col" >
                    <div className="btn-group" role="group" >

                        <input disabled={true} className="btn-check" />
                        <label className={btnGroupClassName} style={{opacity: '1'}} >Select Quote Currency:</label>
                        
                        {
                            quoteCurrencies.map(qc => (
                                <React.Fragment key={qc}>
                                    <input onClick={() => {setCoin(qc)}} defaultChecked={qc==='USDT' ? true : false} type="radio" className="btn-check" name="btnradio" id={qc} autoComplete="off"/>
                                    <label className={btnGroupClassName} htmlFor={qc}>{qc}</label>
                                </React.Fragment>
                            ))
                        }

                    </div>
                </div>
            </div>

            {
                quoteCurrencies.map(qc => (
                    qc === coin ?
                        <div className="row" key={coin}>
                            <div className="col-10" >
                                <div className="cover">
                                    <button className="left" onClick={ ()=>{rightScroll(qc)} } >
                                        <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                                    </button>
                                    <div className="scroll-images" id={qc.concat('scroll')}>
                                        { getTickerButtonsComponent(qc) }
                                    </div>
                                    <button className="right" onClick={ ()=>{leftScroll(qc)} } style={{marginRight: "-20px"}}>
                                        <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    : null
                ))
            }
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
                        marketFilter = {marketFilter}
                        marketsFilter = {marketsFilter}
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
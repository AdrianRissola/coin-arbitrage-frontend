import React, { useState, useEffect } from "react";
import MarketFilter from "../filters/MarketFilter";
import MarketPrices from "../MarketPrices";
import MinProfitFilter from "../filters/MinProfitFilter";
import RowFilter from "../filters/RowFilter";
import TickerButtons from "../TickerButtons";
import MarketsArbitrage from "../MarketsArbitrage";
import "../../HorizontalScroll.css";
import MarketsComboBoxFilter from "../filters/MarketsCheckboxDropdownFilter";
import { getAllAvailableTickers } from "../../service/MarketService"


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
    const [pairCurrencies, setPairCurrencies] = useState([]);
    const [baseCurrencies, setBaseCurrencies] = useState([]);
    const [quoteCurrencies, setQuoteCurrencies] = useState([]);
    const [baseCurrency, setBaseCurrency]  = useState();
    const [quoteCurrency, setQuoteCurrency]  = useState("USDT");
    const ticker = props.ticker;
    const handleChangeChannelSubscriptionClick = props.handleChangeChannelSubscriptionClick;
    const arbitrages = props.arbitrages;
    const marketPrices = props.marketPrices;
    const darkMode = props.darkMode;
    const btnGroupClassName = darkMode ? "btn btn-dark" : "btn btn-light";


    useEffect(() => {
        getAllAvailableTickers().then( response => {
            setPairCurrencies(response.data);
            setBaseCurrencies(Array.from(new Set(response.data.map(bc => bc.name.split('-')[0]))).sort())
            setQuoteCurrencies(Array.from(new Set(response.data.map(bc => bc.name.split('-')[1]))).sort());
        })
    }, []);

    const getTickerButtonsComponent = (baseCurrency, quoteCurrency) => {
        return (
          <TickerButtons
            tickers = { pairCurrencies.filter(at => { 
                return baseCurrency ? at.name.split("-")[0] === baseCurrency : at.name.split("-")[1] === quoteCurrency
            })} 
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
            {/* <div className="row" style={{ textAlign: "left" }}>
                <div className="col" >
                    <div className="btn-group position-relative overflow-auto w-75" role="group" style={{marginTop: '10px', width:'-webkit-fill-available'}}>
                        <input disabled={true} className="btn-check" />
                        <label className={btnGroupClassName} 
                            style={{opacity: '1', width: '-webkit-fill-available', maxWidth:'fit-content', whiteSpace:'nowrap'}} 
                        >
                            Select Pair Currency:
                        </label>
                        <input id={"left"} type="radio" className="btn-check" onClick={ ()=>{rightScroll(baseCurrency || quoteCurrency)} } />
                        <label className={btnGroupClassName} htmlFor={"left"} >
                            {"<<"}
                        </label>
                        {
                            pairCurrencies.filter(at => { 
                                return baseCurrency ? at.name.split("-")[0] === baseCurrency : at.name.split("-")[1] === quoteCurrency
                            })?.map(pc => (
                                <React.Fragment key={ pc.name }>
                                    <input onClick={ ()=>{ handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker: pc.name}) } } 
                                        defaultChecked={pc.name==='BTC' ? true : false} type="radio" className="btn-check" 
                                        name="btnradioPairCurrency" id={pc.name} autoComplete="off"
                                    />
                                    <label className={btnGroupClassName} htmlFor={pc.name} style={{whiteSpace:'nowrap'}} >
                                        {pc.name}
                                    </label>
                                </React.Fragment>
                            ))
                        }
                        <input id={"right"} type="radio" className="btn-check" onClick={ ()=>{leftScroll(baseCurrency || quoteCurrency)} } />
                        <label className={btnGroupClassName} htmlFor={"right"} >
                            {">>"}
                        </label>
                    </div>
                </div>
            </div> */}
            <div className="row justify-content-center">
                <div className="col-sm-10" >
                    <div className="btn-group position-relative overflow-auto" role="group" style={{marginTop: '10px', width:'-webkit-fill-available'}}>
                        <input disabled={true} className="btn-check" />
                        <label className={btnGroupClassName} style={{opacity: '1', width: '-webkit-fill-available', maxWidth:'fit-content'}} >
                            Select Base Currency:
                        </label>
                        {
                            baseCurrencies?.map(bc => (
                                <React.Fragment key={ `quoteCurrency_${bc}` }>
                                    <input onClick={() => {setBaseCurrency(bc);setQuoteCurrency(null)}} 
                                        defaultChecked={bc==='BTC' ? true : false} type="radio" className="btn-check" 
                                        name="btnradio" id={`baseCurrency_${bc}`} autoComplete="off"
                                    />
                                    <label className={btnGroupClassName} htmlFor={`baseCurrency_${bc}`}  >
                                        {bc}
                                    </label>
                                </React.Fragment>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="row justify-content-center" >
                <div className="col-10" >
                    <div className="btn-group position-relative overflow-auto" role="group" style={{marginTop: '10px', width:'-webkit-fill-available'}}>

                        <input disabled={true} className="btn-check" />
                        <label className={btnGroupClassName} style={{opacity: '1', width: '-webkit-fill-available', maxWidth:'fit-content'}} >
                            Select Quote Currency:
                        </label>
                        
                        {
                            quoteCurrencies?.map(qc => (
                                <React.Fragment key={ `quoteCurrency_${qc}` }>
                                    <input onClick={() => {setQuoteCurrency(qc);setBaseCurrency(null);}} 
                                        defaultChecked={qc==='USDT' ? true : false} type="radio" className="btn-check" name="btnradio" 
                                        id={`quoteCurrency_${qc}`} autoComplete="off"
                                    />
                                    <label className={btnGroupClassName} htmlFor={`quoteCurrency_${qc}`} >
                                        {qc}
                                    </label>
                                </React.Fragment>
                            ))
                        }

                    </div>
                </div>
            </div>
            <div className="row justify-content-center" style={{ height: "71px", marginTop: '10px' }}>
                <div className="col-sm-10" >
                    <div className="cover" >
                        <button className="left" onClick={ ()=>{rightScroll(baseCurrency || quoteCurrency)} } >
                            <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                        </button>
                        <div className="scroll-images" id={(baseCurrency || quoteCurrency).concat('scroll')}>
                            { getTickerButtonsComponent(baseCurrency, quoteCurrency) }
                        </div>
                        <button className="right" onClick={ ()=>{leftScroll(baseCurrency || quoteCurrency)} }>
                            <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                        </button>
                    </div>
                </div>
            </div>
    
            
            <div className="row">
                <div className="col-sm-12" style={{textAlign: "center"}}>
                    <h1 style={{fontWeight: 'bold', fontSize:"2.5rem"}}>
                        { ticker } Arbitrage
                    </h1>
                </div>
            </div>
            <RowFilter filters = { getArbitrageFilters() }/>
            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
                <div className="col-sm-6 col-m-7 col-lg-8 col-xl-9" 
                    style={{display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}> 
                    <MarketsArbitrage
                        arbitrages = {arbitrages}
                        marketFilter = {marketFilter}
                        marketsFilter = {marketsFilter}
                        minProfitFilter = {minProfitFilter}
                        darkMode = {darkMode}
                    />
                </div>
                <div className="col-sm-6, col-m-5 col-lg-4 col-xl-3" 
                    style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", 
                    alignContent: "stretch", justifyContent: "center", alignItems: "baseline"}}>
                    <MarketPrices ticker={ticker} marketPrices={marketPrices} darkMode = {darkMode}/>
                </div>
            </div>
        </>
    )
}

export default ArbitrageView
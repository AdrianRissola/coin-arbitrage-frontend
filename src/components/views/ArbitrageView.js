import React, { useState, useEffect } from "react";
import MarketFilter from "../filters/MarketFilter";
import MarketPrices from "../MarketPrices";
import MinProfitFilter from "../filters/MinProfitFilter";
import RowFilter from "../filters/RowFilter";
import TickerButtons from "../TickerButtons";
import MarketsArbitrage from "../MarketsArbitrage";
import "../../HorizontalScroll.css";
import MarketsComboBoxFilter from "../filters/MarketsCheckboxDropdownFilter";
import { getAllAvailableTickers } from "../../service/MarketService";
import { Alert, Box, Button, Snackbar, Tooltip, Typography } from '@mui/material';

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
    const [baseCurrency, setBaseCurrency]  = useState({ name: "BTC" });
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
            setBaseCurrencies(
                Array.from(
                    new Map(
                        response.data.map(pc => {
                            const key = pc.name.split('-')[0];
                            return [
                                key,
                                {
                                    name: key,
                                    description: pc.description.split('-')[0].trim()
                                }
                            ];
                        })
                    ).values()
                ).sort((a, b) => a.name.localeCompare(b.name))
            )
            //setQuoteCurrencies(Array.from(new Set(response.data.map(bc => bc.name.split('-')[1]))).sort());
            setQuoteCurrencies(
                Array.from(
                    new Map(
                        response.data.map(pc => {
                            const key = pc.name.split('-')[1];
                            return [
                                key,
                                {
                                    name: key,
                                    description: pc.description.split('-')[1].trim()
                                }
                            ];
                        })
                    ).values()
                ).sort((a, b) => a.name.localeCompare(b.name))
            )
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
            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} 
                darkMode={darkMode} marginRight={"5px"}
            />,
            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} 
                darkMode={darkMode} marginRight={"5px"}
            />,
            <MarketsComboBoxFilter darkMode = { darkMode } onClickFunction = { setMarketsFilter }
                marketsFilter = { marketsFilter } buttonText = { "Markets"} styleWidth = {"100px"}
            />
          ]
        )  
    }

    return(
        <>  
            <div className="row justify-content-center">
                <div className="col-10">
                    <div className="btn-group position-relative overflow-auto" role="group" style={{marginTop: '10px', width:'-webkit-fill-available'}}>                        
                        <Tooltip title="Select Base Currency" placement="left" arrow enterTouchDelay={0} >
                            <div>
                                <Button className={btnGroupClassName} disabled 
                                    style={{borderRadius:'0', opacity: '0.5', backgroundColor: 'black', height:"38px",
                                        color:"white", width: '-webkit-fill-available', maxWidth:'fit-content'}} >
                                    Base:
                                </Button>
                            </div>  
                        </Tooltip>
                        {
                            baseCurrencies?.map(bc => (
                                <React.Fragment key={ `quoteCurrency_${bc.name}` }>
                                    <input onClick={() => {setBaseCurrency(bc);setQuoteCurrency(null)}} 
                                        defaultChecked={bc.name==='BTC' ? true : false} type="radio" className="btn-check" 
                                        name="btnradio" id={`baseCurrency_${bc.name}`} autoComplete="off"
                                    />
                                    <Tooltip title={bc.description} placement="bottom" arrow>
                                        <label className={btnGroupClassName} htmlFor={`baseCurrency_${bc.name}`}  >
                                            {bc.name}
                                        </label>
                                    </Tooltip>
                                </React.Fragment>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="row justify-content-center" >
                <div className="col-10" >
                    <div className="btn-group position-relative overflow-auto" role="group" style={{marginTop: '10px', width:'-webkit-fill-available'}}>
                        <Tooltip title="Select Quote Currency" placement="left" arrow enterTouchDelay={0}>
                            <div>
                                <Button className={btnGroupClassName} disabled 
                                    style={{borderRadius:'0', opacity: '0.5', backgroundColor: 'black', height:"38px",
                                        color:"white", width: '-webkit-fill-available', maxWidth:'fit-content'}} >
                                    Quote:
                                </Button>
                            </div>
                        </Tooltip>
                        {
                            quoteCurrencies?.map(qc => (
                                <React.Fragment key={ `quoteCurrency_${qc.name}` }>
                                    <input onClick={() => {setQuoteCurrency(qc);setBaseCurrency(null);}} 
                                        defaultChecked={qc.name==='USDT' ? true : false} type="radio" className="btn-check" name="btnradio" 
                                        id={`quoteCurrency_${qc.name}`} autoComplete="off"
                                    />
                                    <Tooltip title={qc.description} placement="bottom" arrow>
                                        <label className={btnGroupClassName} htmlFor={`quoteCurrency_${qc.name}`} >
                                            {qc.name}
                                        </label>
                                    </Tooltip>
                                </React.Fragment>
                            ))
                        }

                    </div>
                </div>
            </div>
            <div className="row justify-content-center" style={{ height: "71px", marginTop: '10px' }}>
                <div className="col-sm-10" >
                    <div className="cover" >
                        <button type="button" className="left" onClick={ ()=>{rightScroll(baseCurrency?.name || quoteCurrency?.name)} } >
                            <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                        </button>
                        <div className="scroll-images" id={(baseCurrency?.name || quoteCurrency?.name).concat('scroll')}>
                            { getTickerButtonsComponent(baseCurrency?.name, quoteCurrency?.name) }
                        </div>
                        {/* <Snackbar style={{position:"absolute"}} open={true} autoHideDuration={1000} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert severity="success" variant="outlined">{`WebSocket Connection: `}</Alert>
                        </Snackbar> */}
                        <button className="right" onClick={ ()=>{leftScroll(baseCurrency?.name || quoteCurrency?.name)} }>
                            <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                        </button>
                    </div>
                </div>
            </div>

            
            
            <div className="row">
                <div className="col-sm-12" style={{textAlign: "center"}}>
                    <h1 style={{fontWeight: 'bold'}}>
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
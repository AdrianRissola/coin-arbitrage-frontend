import React, { useState } from "react";
import { getMarkets } from "../../service/MarketService"
import { arbitrageCardStyle } from '../../styleUtil'
import MarketStatus from "../../components/MarketStatus";

const hiddenStyle = { overflow: "hidden", height: "1.2rem" };

const GetMarketsInfo = (markets, darkMode) => {
    const [collapsedStyle, setCollapsedStyle] = useState(true);
    const textColor = darkMode ? "white" : "black";


    const handleCollapseOnClick = (market) => {
        market.collapsed = !market.collapsed;
        setCollapsedStyle(!collapsedStyle);
        market.currensStyle = market.collapsed ? {} : hiddenStyle;
    }

    return(
        <div className={ arbitrageCardStyle("20px", darkMode).cardClassName} 
            style={{ marginRight:"1rem", padding: "0rem", borderRadius: "20px"}}>
            <div className={ arbitrageCardStyle("20px", darkMode).cardBodyClassName} >
                <table className="table" style={{ color: textColor}}>
                    <thead>
                        <tr align="center">
                            <th>Market ({markets.length})</th>
                            <th style={{verticalAlign:"top"}}>Available Currency Pairs</th>
                            <th></th>
                            <th></th>
                        </tr>
                        <tr align="center">
                            <th></th>
                            <th>WebSocket</th>
                            <th>REST</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            markets.map( market => {
                                return(
                                    <tr key={ market.name }>
                                        <td title={market.type}>
                                            <a href={ market.website } target="_blank" rel="noopener noreferrer">
                                                { market.name }
                                            </a>
                                        </td>             
                                        <td title={`${market.tickers.websocket.length} currency pairs`}>
                                            <div style={ market.currensStyle || hiddenStyle }> 
                                                { market.tickers.websocket.toString() } 
                                            </div>
                                        </td>
                                        <td title={`${market.tickers.rest.length} currency pairs`}>
                                            <div style={ market.currensStyle || hiddenStyle }>  
                                                { market.tickers.rest.toString() } 
                                            </div>
                                        </td>
                                        <td style={{width:"50px"}}>
                                            <button style={{color: darkMode ? "white" : "black"}} onClick={()=>{handleCollapseOnClick(market)}}>
                                                { !market.collapsed ? "+" : "-" }
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                    <tfoot>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

const MarketStatusView = (props)=> {
    const [markets, setMarkets] = useState([])
    const darkMode = props.darkMode
    const marketStatus = props.marketStatus;

    React.useEffect(() => {
        getMarkets().then(
            response => {
                setMarkets(response.data.sort((m1, m2) => (m1.name > m2.name) ? 1 : ((m2.name > m1.name) ? -1 : 0)))
            }
        );
    }, []);


    return(
        <>
            <div className="row">
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Markets
                    </h1>
                </div>
            </div>
            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
                <div className="col-sm-9 col-m-8 col-lg-7 col-xl-6" 
                    style={{display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}> 
                    { GetMarketsInfo(markets, darkMode) }
                </div>
                <div className="col-sm-3, col-m-4 col-lg-5 col-xl-6" 
                    style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", 
                    alignContent: "stretch", justifyContent: "center", alignItems: "baseline"}}>
                    <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/>
                </div>
            </div>
            {/* <div className="row">
                <div className="col-sm-8" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                    { GetMarketsInfo(markets, darkMode) }
                </div>
                <div className="col-sm-4" style={{flexDirection: "row", flexWrap: "wrap", marginLeft: "-1rem"}}>
                    <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/>
                </div>
            </div> */}
        </>
    )
}

export default MarketStatusView
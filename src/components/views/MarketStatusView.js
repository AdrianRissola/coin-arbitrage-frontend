import React, { useState } from "react";
import { getMarkets } from "../../service/MarketService"
import { arbitrageCardStyle } from '../../styleUtil'
import MarketStatus from "../../components/MarketStatus";

const getMarketsInfo = (markets, darkMode) => {
    return(
        <div className={ arbitrageCardStyle("20px", darkMode).cardClassName} 
            style={{ marginRight:"1rem", padding: "0rem", borderRadius: "20px"}}>
            <div className={ arbitrageCardStyle("20px", darkMode).cardBodyClassName} >
                <table className="table">
                    <thead>
                        <tr align="center">
                            <th>Market ({markets.length})</th>
                            <th>Available Tickers</th>
                            <th></th>
                        </tr>
                        <tr align="center">
                            <th></th>
                            <th>WebSocket</th>
                            <th>REST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            markets.map( market => {
                                return(
                                    <tr key={ market.name }>
                                        <td title={market.type}>
                                            <a href={ market.website } target="_blank"rel="noopener noreferrer">
                                                { market.name }
                                            </a>
                                        </td>             
                                        <td>
                                            {market.tickers.websocket.toString()} 
                                        </td>
                                        <td>
                                            { 
                                                market.tickers.rest.toString()
                                                // market.tickers.rest.map(ticker => 
                                                //     <a key={ ticker } href={marketticker.RestEndpoint}>
                                                //         {ticker}, 
                                                //     </a>
                                                // )
                                            } 
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
            <div className="row">
                <div className="col-sm-8" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                    { getMarketsInfo(markets, darkMode) }
                </div>
                <div className="col-sm-4" style={{flexDirection: "row", flexWrap: "wrap", marginLeft: "-1rem"}}>
                    <MarketStatus marketsStatus = {marketStatus} darkMode = {darkMode}/>
                </div>
            </div>
        </>
    )
}

export default MarketStatusView
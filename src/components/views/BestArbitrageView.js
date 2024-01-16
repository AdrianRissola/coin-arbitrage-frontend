import { Tooltip } from "@mui/material";
import { useState } from "react";
import Arbitrage from "../Arbitrage";
import MarketPrices from "../MarketPrices";

const BestArbitrageView = (props)=> {
    const [coin, setCoin] = useState();
    const darkMode = props.darkMode;
    const bestArbitrages = props.bestArbitrage;
    const marketPrices = props.marketPrices;
    
    const selectedArbitrage =
    coin && bestArbitrages ?
    bestArbitrages.filter(arbitrage => arbitrage.transactions[0].pair.split('-')[1]===coin)[0]
    : bestArbitrages[0].profitPercentage > bestArbitrages[1].profitPercentage ? 
        bestArbitrages[0] : bestArbitrages[1];
    
    const selectedMarketPrices = marketPrices[selectedArbitrage.transactions[0].pair]

    const btnGroupClassName = darkMode ? "btn btn-dark" : "btn btn-light";

    return(
        <div style={{marginTop:"10px"}}>
            <div className="row" style={{display: "flex", flexDirection: "col", flexWrap: "wrap", justifyContent: "center" }}>
                <div className="col-4" style={{display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}>
                    <div className="btn-group" role="group" >
                        <input onClick={ () => {setCoin()} } defaultChecked={true} type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off"/>
                        <Tooltip title="Select Best Arbitrage" arrow enterTouchDelay="0" >
                            <label className={btnGroupClassName} htmlFor="btnradio1">Best</label>
                        </Tooltip>
                        <input onClick={ () => {setCoin('USDT')} } type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off"/>
                        <Tooltip title="Select Best USDT Arbitrage" arrow enterTouchDelay="0" >
                            <label className={btnGroupClassName} htmlFor="btnradio2">USDT</label>
                        </Tooltip>
                        <input onClick={ () => {setCoin('BTC')} } type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off"/>
                        <Tooltip title="Select Best BTC Arbitrage" arrow enterTouchDelay="0" >
                            <label className={btnGroupClassName} htmlFor="btnradio3">BTC</label>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <br/>
            <div className="row">
                <div className="col" style={{ textAlign: "center" }}>
                    <h1 style={{ fontWeight: 'bold' }}> Best {coin} Arbitrage </h1>
                </div>
            </div>
            <br/>
            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-evenly"}}>
                <div  
                style={{display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}> 
                    <Arbitrage darkMode = { darkMode }
                        header = { "Best Arbitrage: " + selectedArbitrage.transactions[0].pair }
                        arbitrage = { selectedArbitrage }
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap",
                    alignContent: "stretch", justifyContent: "center", alignItems: "baseline"}}>
                    <MarketPrices ticker = { selectedArbitrage.transactions[0].pair } 
                        marketPrices={ selectedMarketPrices } darkMode = { darkMode }
                    />
                </div>
            </div>
        </div>
    )
}

export default BestArbitrageView
import { Tooltip } from "@mui/material";
import { Fragment, useState } from "react";
import Arbitrage from "../Arbitrage";
import MarketPrices from "../MarketPrices";

const BestArbitrageView = (props)=> {
    const [coin, setCoin] = useState();
    const darkMode = props.darkMode;
    const bestArbitrages = props.bestArbitrage;
    const marketPrices = props.marketPrices;
    const selectedArbitrage =
    (coin && bestArbitrages) 
        ? bestArbitrages.filter(arbitrage => arbitrage.transactions[0].pair.split('-')[1]===coin)[0]
        : bestArbitrages.reduce((bestArbit1, bestArbit2) => bestArbit1.profitPercentage > bestArbit2.profitPercentage ? bestArbit1 : bestArbit2)
    
    const selectedMarketPrices = marketPrices[selectedArbitrage.transactions[0].pair]

    const btnGroupClassName = darkMode ? "btn btn-dark" : "btn btn-light";

    return(
        <div style={{marginTop:"10px"}}>
            <div className="row justify-content-center">
                <div className="col-8">
                    <div className="row" style={{display: "flex", flexDirection: "col", flexWrap: "wrap", justifyContent: "center" }}>
                        <div className="btn-group position-relative overflow-auto" role="group" >
                            <input onClick={ () => {setCoin()} } defaultChecked={true} type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off"/>
                            <Tooltip title="Best Arbitrage" arrow enterTouchDelay={0} >
                                <label className={btnGroupClassName} htmlFor="btnradio1">Best</label>
                            </Tooltip>
                            { 
                                bestArbitrages.map(bestArbit => bestArbit.transactions[0].pair.split("-")[1]).sort().map(
                                    quote => {
                                        return(
                                            <Fragment>
                                                <input onClick={ () => { setCoin(quote) } } type="radio" 
                                                className="btn-check" name="btnradio" id={quote} autoComplete="off"/>
                                                <Tooltip title="Best Arbitrage" arrow enterTouchDelay={0} >
                                                    <label className={btnGroupClassName} htmlFor={quote}>
                                                        {quote}
                                                    </label>
                                                </Tooltip>
                                            </Fragment>
                                        )
                                    }
                                )
                            }
                        </div>
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
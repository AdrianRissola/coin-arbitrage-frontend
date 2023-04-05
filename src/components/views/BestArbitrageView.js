import { useState } from "react";
import Arbitrage from "../Arbitrage";
import MarketPrices from "../MarketPrices";




const BestArbitrageView = (props)=> {
    const [coin, setCoin] = useState();
    const darkMode = props.darkMode;
    const bestArbitrages = props.bestArbitrage;
    const marketPrices = props.marketPrices;

    console.log("bestArbitrages: ", bestArbitrages);
    console.log("profitPercentage: ", bestArbitrages[0].profitPercentage);
    
    const selectedArbitrage =
    coin ?
    bestArbitrages.filter(arbitrage => arbitrage.transactions[0].pair.split('-')[1]===coin)[0]
    : bestArbitrages[0].profitPercentage > bestArbitrages[1].profitPercentage ? 
        bestArbitrages[0] : bestArbitrages[1];
    
    const selectedMarketPrices = marketPrices[selectedArbitrage.transactions[0].pair]

    const btnGroupClassName = darkMode ? "btn btn-dark" : "btn btn-light";




    return(
        <div style={{ marginLeft:"10rem", marginRight:"10rem" }}>
            <div className="row" style={{ textAlign: "center" }}>
                <div className="col" >
                    <div className="btn-group" role="group" >

                        <input onClick={ () => {setCoin()} } defaultChecked={true} type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off"/>
                        <label className={btnGroupClassName} htmlFor="btnradio1">Best</label>

                        <input onClick={ () => {setCoin('USDT')} } type="radio" class="btn-check" name="btnradio" id="btnradio2" autoComplete="off"/>
                        <label className={btnGroupClassName} htmlFor="btnradio2">USDT</label>

                        <input onClick={ () => {setCoin('BTC')} } type="radio" class="btn-check" name="btnradio" id="btnradio3" autoComplete="off"/>
                        <label className={btnGroupClassName} htmlFor="btnradio3">BTC</label>

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
            <div className="row" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                <div className="col-sm" align="center">
                    <Arbitrage
                        darkMode = { darkMode }
                        header = { "Best Arbitrage: " + selectedArbitrage.transactions[0].pair }
                        arbitrage = { selectedArbitrage }
                    />
                </div>
                <div className="col-sm" align="center" > 
                    <MarketPrices ticker = { selectedArbitrage.transactions[0].pair } 
                        marketPrices={ selectedMarketPrices } darkMode = { darkMode }
                    /> 
                </div>
            </div>
        </div>
    )
}

export default BestArbitrageView
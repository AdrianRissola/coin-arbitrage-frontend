import Arbitrage from "../Arbitrage";
import MarketPrices from "../MarketPrices";
import MarketStatus from "../MarketStatus";

const BestArbitrageView = (props)=> {
    const darkMode = props.darkMode;
    const bestArbitrage = props.bestArbitrage;
    const marketPrices = props.marketPrices;
    const marketStatus = props.marketStatus;

    return(
        <>
            <div className="row">
                <div className="col" style={{ textAlign: "center" }}>
                    <h1 style={{ fontWeight: 'bold' }}> Best Arbitrage </h1>
                </div>
            </div>
            <br/>
            <div className="row" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                <div class="col-sm" align="center">
                    <Arbitrage
                        darkMode = { darkMode }
                        header = { "Best Arbitrage: " + bestArbitrage.transactions[0].pair }
                        arbitrage = { bestArbitrage  }
                    />
                </div>
                <div class="col-sm" align="center" > 
                    <MarketPrices ticker = { bestArbitrage.transactions[0].pair } 
                        marketPrices={ marketPrices } darkMode = { darkMode }
                    /> 
                </div>
                <div class="col-sm" align="center">
                    <MarketStatus marketsStatus = { marketStatus } darkMode = { darkMode }/>
                </div>
            </div>
        </> 
    )
}

export default BestArbitrageView
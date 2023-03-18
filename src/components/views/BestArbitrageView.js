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
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Best Arbitrage
                    </h1>
                </div>
            </div>
            <br/>
            <div className="row">
                <div  
                    style={{display: "flex", flexDirection: "row", flexWrap: "wrap", marginLeft: "2rem"}}>
                    <Arbitrage
                        darkMode = { darkMode }
                        header = { "Best Arbitrage: " + bestArbitrage.transactions[0].pair }
                        arbitrage = { bestArbitrage  }
                    />
                </div>
                <div  
                    style={{flexDirection: "row", flexWrap: "wrap", marginLeft: "2.5rem"}}>
                    <MarketPrices ticker = { bestArbitrage.transactions[0].pair } 
                        marketPrices={ marketPrices } darkMode = { darkMode }
                    /> 
                </div>
                <div  
                    style={{display: "flex", flexDirection: "row", flexWrap: "wrap", marginLeft: "2rem"}}>
                    <MarketStatus marketsStatus = { marketStatus } darkMode = { darkMode }/>
                </div>
            </div>
        </> 
    )
}

export default BestArbitrageView
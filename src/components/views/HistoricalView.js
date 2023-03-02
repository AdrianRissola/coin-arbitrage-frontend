import React, { useState } from "react";
import { getHistoricalArbitrages } from "../../service/ArbitrageService"
import helper from "../../helper";
import ArbitrageList from "../ArbitrageList";


const HistoricalView = (props)=> {
    const [historicalArbitrages, setHistoricalArbitrages] = useState([])
    const filters = props.filters
    const menuSelection = props.menuSelection;
    const marketFilter = props.marketFilter;
    const minProfitFilter = props.minProfitFilter;
    const tickerFilter = props.tickerFilter;
    const darkMode = props.darkMode;
    const orderBy = props.historicalArbitrageOrder;


    React.useEffect(() => {
        getHistoricalArbitrages().then(
            response => {
                console.log("HistoricalView.getHistoricalArbitrages:", response)
                setHistoricalArbitrages(response.data)
            }
        );
    }, []);
    

    return(
        <>
            { menuSelection?.historicalViewEnabled === true ?
                <>
                    <div className="row">
                        <div className="col" style={{textAlign: "center"}}>
                            <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                                Historical
                            </h1>
                        </div>
                    </div>
                    { filters }
                    <div className="row">
                        <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
                            <ArbitrageList
                                arbitrages = { historicalArbitrages }
                                initArb = { helper.initialArbitrage }
                                marketFilter = { marketFilter }
                                minProfitFilter = { minProfitFilter }
                                tickerFilter = { tickerFilter }
                                darkMode = { darkMode }
                                orderBy = { orderBy }
                                withHeader = { true }
                            />
                        </div>
                    </div>
                </>
                :
                null
            }
        </>
    )
}

export default HistoricalView
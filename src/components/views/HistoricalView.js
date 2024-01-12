import React, { useState, useCallback } from "react";
import { getHistoricalArbitrages } from "../../service/HistoricalArbitrageService"
import ArbitrageList from "../ArbitrageList";
import helper from "../../helper";
import RowFilter from "../../components/filters/RowFilter";
import SplitButtonComboBox from "../../components/filters/SplitButtonComboBox";
import MarketFilter from "../../components/filters/MarketFilter";
import MinProfitFilter from "../../components/filters/MinProfitFilter";
import MarketsCheckboxDropdownFilter from "../filters/MarketsCheckboxDropdownFilter";
import TickersCheckboxDropdownFilter from "../filters/TickersCheckboxDropdownFilter";



const HistoricalView = (props)=> {
    const [historicalArbitrages, setHistoricalArbitrages] = useState(null);
    const [marketFilter, setMarketFilter] = useState("");
    const [marketsFilter, setMarketsFilter] = useState([]);
    const [minProfitFilter, setMinProfitFilter] = useState(0)
    const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "date", value: "DESC", label: "Date"})
    const availableTickers = [...JSON.parse(localStorage.getItem("availableWebsocketTickers"))];
    const darkMode = props.darkMode;

    const callGetHistoricalArbitrages = useCallback(async (tickersFilter) => {
        const {data} = await getHistoricalArbitrages(
            availableTickers.length===tickersFilter.length ? null : tickersFilter
        );
        setHistoricalArbitrages(data);
    }, [availableTickers.length])

    React.useEffect(() => {
        console.log('React.useEffect: callGetHistoricalArbitrages')
        callGetHistoricalArbitrages(["BTC-USDT"]);
    }, [callGetHistoricalArbitrages]);

    const handleOnClickFindButton = (selectedTickers) => {
        if(selectedTickers && selectedTickers.length>0) {
            setHistoricalArbitrages(null); 
            callGetHistoricalArbitrages(selectedTickers);
        };
    }

    const handleSelectedHistoricalArbitrageOrderOnClick = (selectedHistoricalArbitrageOrder) => {
        if(selectedHistoricalArbitrageOrder.field) {
          if(historicalArbitrageOrder.field!==selectedHistoricalArbitrageOrder.field) 
            setHistoricalArbitrageOrder(selectedHistoricalArbitrageOrder)
          } else {
            setHistoricalArbitrageOrder(historicalArbitrageOrder)
          }
    }

    const handleSelectedHistoricalArbitrageOrderOnClickk = (selectedHistoricalArbitrageOrder) => {
        setHistoricalArbitrageOrder(selectedHistoricalArbitrageOrder)  
    }

    const getArbitrageFilters = () => {
        return (
          [
            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} 
                marginRight={"0.1rem"} styleWidth = {"210px"}
            />,
            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} 
                darkMode={darkMode} marginRight={"0.1rem"} styleWidth = {"210px"}
            />,
          ]
        )
    }
    
    const getHistoricalFilters = () => {
        const historicalFilters = getArbitrageFilters();
        historicalFilters.push(
            <MarketsCheckboxDropdownFilter darkMode = { darkMode } onClickFunction = { setMarketsFilter }
                marketsFilter = { marketsFilter } buttonText = { "Markets"} styleWidth = {"110px"} marginRight={"0.1rem"}
            />
        );
        historicalFilters.push(
            <TickersCheckboxDropdownFilter darkMode = { darkMode }
                handleOnClickFindButton = { handleOnClickFindButton }
                buttonText = { "Tickers"} styleWidth = {"150px"} marginRight={"0.1rem"}
            />
        );
        
        historicalFilters.push(
        <SplitButtonComboBox darkMode = { darkMode } 
            optionOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClick }
            buttonOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClickk }
            currentSelection = { historicalArbitrageOrder } buttonText = { "Order By: "}
            options = { 
                [{key: "profitPercentage", value: "DESC", label: "Profit %"}, {key: "date", value: "DESC", label: "Date"}]
            }
            styleWidth = {"220px"}
        />);

        return historicalFilters;
    }

    const getHistoricalRowFilterComponent = () => {
        return ( <RowFilter filters = { getHistoricalFilters() }/> )
    }



    return(
        <>
            <div className="row">
                <div className="col-sm-12" style={{ textAlign: "center" }}>
                    <h1 style={{fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Historical
                    </h1>
                </div>
            </div>
            { getHistoricalRowFilterComponent() }
            {
                !historicalArbitrages ?
                <div className="row justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                : null
            }
            <div className="row" style={{justifyContent: "center"}}>
                {/* <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}> */}
                    { historicalArbitrages && historicalArbitrages.length>0 ?
                        <ArbitrageList
                            arbitrages = { historicalArbitrages }
                            initArb = { helper.initialArbitrage }
                            marketFilter = { marketFilter }
                            marketsFilter = { marketsFilter }
                            minProfitFilter = { minProfitFilter }
                            darkMode = { darkMode }
                            orderBy = { historicalArbitrageOrder }
                            withHeader = { true }
                        />
                        : null
                    }
                {/* </div> */}
            </div>
        </>
    )

    
}

export default HistoricalView
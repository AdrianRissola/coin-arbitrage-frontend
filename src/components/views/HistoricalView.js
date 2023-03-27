import React, { useState } from "react";
import { getHistoricalArbitrages } from "../../service/HistoricalArbitrageService"
import ArbitrageList from "../ArbitrageList";
import helper from "../../helper";
import RowFilter from "../../components/filters/RowFilter";
import SplitButtonComboBox from "../../components/filters/SplitButtonComboBox";
import ComboBoxFilter from "../../components/filters/ComboBoxFilter";
import MarketFilter from "../../components/filters/MarketFilter";
import MinProfitFilter from "../../components/filters/MinProfitFilter";
import MarketsComboBoxFilter from "../filters/MarketsCheckboxDropdownFilter";



const HistoricalView = (props)=> {
    const [historicalArbitrages, setHistoricalArbitrages] = useState(JSON.parse(localStorage.getItem("historicalArbitrages")));
    const [marketFilter, setMarketFilter] = useState("");
    const [marketsFilter, setMarketsFilter] = useState([]);
    const [minProfitFilter, setMinProfitFilter] = useState(0)
    const [tickerFilter, setTickerFilter] = useState("BTC-USDT")
    const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "date", value: "DESC", label: "Date"})
    const availableTickers = ["ALL", ...JSON.parse(localStorage.getItem("availableWebsocketTickers"))];
    const darkMode = props.darkMode;



 
    const callGetHistoricalArbitrages = async (tickerFilter) => {
        const {data} = await getHistoricalArbitrages(tickerFilter==='ALL' ? null : tickerFilter);
        setHistoricalArbitrages(data);
    }

    const handleSelectedTickerOnClick = (selectedTicker) => {
        if(tickerFilter!==selectedTicker) {
            setTickerFilter(selectedTicker);
            callGetHistoricalArbitrages(selectedTicker);
        };
    }

    const getArbitrageFilters = () => {
        return (
          [
            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} />,
            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} darkMode={darkMode} />,
          ]
        )
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
    
    const getHistoricalFilters = () => {
        const historicalFilters = getArbitrageFilters();
        historicalFilters.push(
            <MarketsComboBoxFilter darkMode = { darkMode } onClickFunction = { setMarketsFilter }
                marketsFilter = { marketsFilter } buttonText = { "Markets"} styleWidth = {"100px"}
            />
        );
        historicalFilters.push(
            <ComboBoxFilter darkMode = { darkMode } onClickFunction = { handleSelectedTickerOnClick }
                currentSelection = { tickerFilter } buttonText = { "Ticker: "}
                options = { availableTickers } styleWidth = {"175px"}
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
            styleWidth = {"350px"} 
        />);

        return historicalFilters;
    }

    const getHistoricalRowFilterComponent = () => {
        return ( <RowFilter filters = { getHistoricalFilters() }/> )
    }



    return(
        <>
            <div className="row">
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Historical
                    </h1>
                </div>
            </div>
            { getHistoricalRowFilterComponent() }
            <div className="row">
                <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                    { historicalArbitrages.length>0 ?
                        <ArbitrageList
                            arbitrages = { historicalArbitrages }
                            initArb = { helper.initialArbitrage }
                            marketFilter = { marketFilter }
                            marketsFilter = { marketsFilter }
                            minProfitFilter = { minProfitFilter }
                            tickerFilter = { tickerFilter }
                            darkMode = { darkMode }
                            orderBy = { historicalArbitrageOrder }
                            withHeader = { true }
                        />
                        : null
                    }
                </div>
            </div>
        </>
    )

    
}

export default HistoricalView
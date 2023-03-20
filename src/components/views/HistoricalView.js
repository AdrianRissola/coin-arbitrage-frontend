import React, { useState } from "react";
import { getHistoricalArbitrages } from "../../service/HistoricalArbitrageService"
import ArbitrageList from "../ArbitrageList";
import helper from "../../helper";
import RowFilter from "../../components/filters/RowFilter";
import SplitButtonComboBox from "../../components/filters/SplitButtonComboBox";
import ComboBoxFilter from "../../components/filters/ComboBoxFilter";
import MarketFilter from "../../components/filters/MarketFilter";
import MinProfitFilter from "../../components/filters/MinProfitFilter";
import MarketsComboBoxFilter from "../../components/filters/MarketsComboBoxFilter";


const HistoricalView = (props)=> {
    const [historicalArbitrages, setHistoricalArbitrages] = useState([])
    const [marketFilter, setMarketFilter] = useState("")
    const [minProfitFilter, setMinProfitFilter] = useState(0)
    const [tickerFilter, setTickerFilter] = useState("BTC-USDT")
    // const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "profitPercentage", value: "DESC", label: "Profit %"})
    const [historicalArbitrageOrder, setHistoricalArbitrageOrder] = useState({key: "date", value: "DESC", label: "Date"})
    const darkMode = props.darkMode;

    const handleSelectedTickerOnClick = (selectedTicker) => {
        if(tickerFilter!==selectedTicker) setTickerFilter(selectedTicker)
    }

    const getArbitrageFilters = () => {
        return (
          [
            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} />,
            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} darkMode={darkMode} />,
          ]
        )
    }

    const getTickersFromHistoricalArbitrageList = () => {
        const tickers = ["ALL"].concat(historicalArbitrages.map(arbitrage => {
          return(arbitrage.transactions[0].pair)
        }).sort())
        return [...new Set(tickers)];
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
            <ComboBoxFilter darkMode = { darkMode } onClickFunction = { handleSelectedTickerOnClick }
                currentSelection = { tickerFilter } buttonText = { "Ticker: "}
                options = { getTickersFromHistoricalArbitrageList() } styleWidth = {"175px"}
            />
        );
        // historicalFilters.push(
        //     <MarketsComboBoxFilter darkMode = { darkMode } onClickFunction = { handleSelectedTickerOnClick }
        //         currentSelection = { tickerFilter || "ALL" } buttonText = { "Ticker: "}
        //         options = { getTickersFromHistoricalArbitrageList() } styleWidth = {"175px"}
        //     />
        // );
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
                    <ArbitrageList
                        arbitrages = { historicalArbitrages }
                        initArb = { helper.initialArbitrage }
                        marketFilter = { marketFilter }
                        minProfitFilter = { minProfitFilter }
                        tickerFilter = { tickerFilter }
                        darkMode = { darkMode }
                        orderBy = { historicalArbitrageOrder }
                        withHeader = { true }
                    />
                </div>
            </div>
        </>
    )

    
}

export default HistoricalView
import React, { useState, useCallback } from "react";
import { getHistoricalArbitrages } from "../../service/HistoricalArbitrageService"
import ArbitrageList from "../ArbitrageList";
import helper from "../../helper";
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
    const [showFilters, setShowFilters] = useState(false)
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

    const buildInputGroup = (component, width, marginRight) => {
        return (
            <div className="input-group mb-3"
                style={{ 
                    display:"flex",
                    width: width || "fit-content",
                    marginRight: marginRight,
                    marginLeft: '0px' 
                }}
            >
                {component}
            </div>
        )
    }

    const getSearchAndFilters = () => {
        return ( 
            <div className="row" style={{display:"flex", flexDirection:"row", marginLeft:"50px"}}>
                <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-3" style={{display:"flex", flexDirection:"row", justifyContent:"left"}}>
                    {
                        buildInputGroup(
                            <TickersCheckboxDropdownFilter darkMode = { darkMode }
                                handleOnClickFindButton = { handleOnClickFindButton }
                                buttonText = { "Tickers "} styleWidth = {"200px"}
                            />, 
                            "auto"
                        )
                    }
                    <div className="input-group-prepend">
                        <button type="button" className={darkMode ? "btn text-white bg-dark" : "btn text-white bg-dark"} 
                            style={{height:'fit-content', marginLeft:'1rem'}} 
                            onClick={()=>{setShowFilters(prev=>!prev)}}>
                            Refine
                            { 
                                !showFilters ?
                                <svg style={{marginLeft: "10px", marginBottom: "3px"}}
                                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"></path>
                                </svg>
                                :
                                <svg style={{marginLeft: "10px", marginBottom: "3px"}}
                                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"></path>
                                </svg>
                            }
                        </button>
                    </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9" hidden={!showFilters}
                    style={{display:"flex", flexDirection:"row", flexWrap:"wrap", justifyContent:"left"}}>
                    {
                        buildInputGroup(
                            <MarketFilter marketFilter = {marketFilter} marketFilterSetFunction = {setMarketFilter} darkMode={darkMode} 
                                styleWidth = {"100px"}
                            />,
                            "200px", '1rem'
                        )
                    }
                    {
                        buildInputGroup(
                            <MinProfitFilter minProfitFilter = {minProfitFilter} minProfitFilterSetFunction = {setMinProfitFilter} 
                                darkMode={darkMode}
                            />,
                            "200px", '1rem'
                        )
                    }
                    {
                        buildInputGroup(
                            <MarketsCheckboxDropdownFilter darkMode = { darkMode } onClickFunction = { setMarketsFilter }
                                marketsFilter = { marketsFilter } buttonText = { "Markets"} styleWidth = {"100px"} marginRight={"0.1rem"}
                            />,
                            "auto", '1rem'
                        )
                    }
                    {
                        buildInputGroup(
                            <SplitButtonComboBox darkMode = { darkMode } 
                                optionOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClick }
                                buttonOnClickFunction = { handleSelectedHistoricalArbitrageOrderOnClickk }
                                currentSelection = { historicalArbitrageOrder } buttonText = { "Order By: "}
                                options = { 
                                    [{key: "profitPercentage", value: "DESC", label: "Profit %"}, {key: "date", value: "DESC", label: "Date"}]
                                }
                                styleWidth = {"220px"}
                            />,
                            "auto", '1rem'
                        )
                    }
                </div>
            </div>
        )
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
            { getSearchAndFilters() }
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
            </div>
        </>
    )

    
}

export default HistoricalView
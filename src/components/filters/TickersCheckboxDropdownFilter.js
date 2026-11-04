import React, { useState, useEffect, useRef, useId } from "react";
import search_svg from "../../../src/search.svg";
import { getAllAvailableTickers } from '../../service/MarketService';

const defaultSelectecdTicker = 'BTC-USDT';

const TickersCheckboxDropdown = (props)=> {
    const checkboxId = useId();
    const quoteCurrencies = useRef([]);
    const availableTickers = useRef([]);
    
    const [selectedTickers, setSelectedTickers] = useState([defaultSelectecdTicker]);
    const [requestError, setRequestError] = useState(null);
    const [requestVersion, setRequestVersion] = useState(0);
    const allChecked = availableTickers.current.length > 0 && availableTickers.current.every(ticker => ticker.checked);
    const allQuotesChecked = new Map(quoteCurrencies.current.map(quote => {
        const group = availableTickers.current.filter(ticker => ticker.tickerName.split('-')[1] === quote);
        return [quote, group.length > 0 && group.every(ticker => ticker.checked)];
    }));

    const handleOnClickFindButton = props.handleOnClickFindButton;
    const buttonText = props.buttonText;
    const darkMode = props.darkMode;
    const findButtonClassName = darkMode ? "btn btn-secondary text-white bg-dark" : "btn btn-secondary";
    const dropdownButtonClassName = darkMode ? "btn btn-secondary dropdown-toggle text-white bg-dark" : "btn btn-secondary dropdown-toggle";
    const buttonStyle = !darkMode ? {
        borderTopRightRadius: "0rem", borderBottomRightRadius: "0rem",
        backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
    } : { backgroundColor: null, color: null, borderTopRightRadius: "0rem", borderBottomRightRadius: "0rem" };

    const findButtonStyle = !darkMode ? {
        borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem",
        backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px",
    } : { backgroundColor: null, color: null, borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem" };


    useEffect(() => {
        let active = true;
        setRequestError(null);
        getAllAvailableTickers().then( response => {
            if (!active) return;
            availableTickers.current = response.data.map(ticker => ticker.name).sort().map(ticker => {
                return {
                    tickerName: ticker,
                    checked: ticker === defaultSelectecdTicker ? true : false,
                }
            });
            quoteCurrencies.current = Array.from(new Set(response.data.map(bc => bc.name.split('-')[1]))).sort();
            setSelectedTickers([...availableTickers.current.filter(ticker=>ticker.checked).map(ticker=>ticker.tickerName)]);
        }).catch(() => {
            if (!active) return;
            availableTickers.current = [];
            quoteCurrencies.current = [];
            setSelectedTickers([]);
            setRequestError('Ticker filters are not available');
        });
        return () => { active = false; };
    }, [requestVersion]);

    const handleSelectedTickersOnClick = (checked, selectedTicker) => {
        selectedTicker.checked = checked;
        setSelectedTickers(selected => checked
            ? [...selected, selectedTicker.tickerName]
            : selected.filter(ticker => ticker !== selectedTicker.tickerName));
    }

    const handleSelectAllOnClick = (checked) => {
        availableTickers.current.forEach(ticker => {
            ticker.checked = checked
        });
        if(checked) {
            setSelectedTickers([...availableTickers.current.map(ticker=>ticker.tickerName)]);
        } else {
            setSelectedTickers([]);
        }
    }

    const handleSelectAllByQuoteCurrencyOnClick = (checked, currency) => {
        if(checked) {
            const selectedTickersByCoin = [];
            availableTickers.current.forEach( ticker => {
                ticker.checked = false;
                if(ticker.tickerName.split("-")[1] === currency){
                    ticker.checked = checked;
                    selectedTickersByCoin.push(ticker.tickerName);
                }
            });
            setSelectedTickers(selectedTickersByCoin);
        } else {
            handleSelectAllOnClick(false);
        }
    }

    return(
        <>
            {requestError && <div role="alert" className="alert alert-danger">
                {requestError} <button type="button" onClick={() => setRequestVersion(version => version + 1)}>Retry ticker filter</button>
            </div>}
            <div >
                <div className="dropdown">
                    <div className="btn-group" role="group">
                        
                        {/* <label style={{verticalAlign:"middle", alignSelf:"center", fontSize:"20px", 
                        fontWeight:"bolder", fontStyle:"italic"}}>Search:&nbsp;</label> */}
                        
                        <button className= { dropdownButtonClassName } type="button" id="dropdownMenuButton"
                            title = {"Current selection: " + selectedTickers}
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={ buttonStyle }>
                            { buttonText }
                        </button>
                        <button className= { findButtonClassName } type="button" id="findButtonId"
                            onClick = {()=> handleOnClickFindButton(selectedTickers) }
                            style= { findButtonStyle }>
                            <img src={ search_svg } alt="Find" />
                        </button> 
                        
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton" style= {{ maxHeight:"500px", overflow:"auto" }} >
                            <li>
                                <a className="dropdown-item" href="/#">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id={`${checkboxId}-all`}
                                            checked = { allChecked }
                                            onChange={(event)=>{ handleSelectAllOnClick(event.target.checked) }}
                                        />
                                        <label className="form-check-label" htmlFor={`${checkboxId}-all`}>Select All</label>
                                    </div>
                                </a>
                            </li>
                            {
                                // quoteCurrencies.current.map( qc => (
                                    [...allQuotesChecked.keys()].map( qc => (
                                    <li key={qc}>
                                        <a className="dropdown-item" href="/#">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" value="" id={`${checkboxId}-quote-${qc}`}
                                                    checked = { allQuotesChecked.get(qc) }
                                                    onChange={(event)=>{ handleSelectAllByQuoteCurrencyOnClick(event.target.checked, qc) }}
                                                />
                                                <label className="form-check-label" htmlFor={`${checkboxId}-quote-${qc}`}>Select All {qc}</label>
                                            </div>
                                        </a>
                                    </li>
                                ))
                            }
                            {/* <li>
                                <a className="dropdown-item" href="/#">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="selectAllUSDTId"
                                            checked = { allUsdtChecked }
                                            onChange={(event)=>{ handleSelectAllByCoinOnClick(event.target.checked, "USDT") }}
                                        />
                                        <label className="form-check-label" htmlFor="selectAllUSDTId">Select All USDT</label>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/#">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="selectAllBTCId"
                                            checked = { allBtcChecked }
                                            onChange={(event)=>{ handleSelectAllByCoinOnClick(event.target.checked, "BTC") }}
                                        />
                                        <label className="form-check-label" htmlFor="selectAllBTCId">Select All BTC</label>
                                    </div>
                                </a>
                            </li> */}
                            <li><hr className="dropdown-divider"/></li>
                            { availableTickers.current.map(option => 
                                <li key= { option.tickerName } >
                                    <a className="dropdown-item" href="/#">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" value="" id={`${checkboxId}-ticker-${option.tickerName}`}
                                                checked = { option.checked }
                                                onChange = { (event)=>{
                                                    handleSelectedTickersOnClick(event.target.checked, option);
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`${checkboxId}-ticker-${option.tickerName}`}>{ option.tickerName }</label>
                                        </div>
                                    </a>
                                </li>)
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TickersCheckboxDropdown
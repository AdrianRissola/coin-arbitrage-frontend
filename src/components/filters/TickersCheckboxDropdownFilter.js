import React, { useState } from "react";
import search_svg from "../../../src/search.svg";

const defaultSelectecdTicker = 'BTC-USDT';
const availableTickers = JSON.parse(localStorage.getItem("availableWebsocketTickers")).map(ticker => {
    return {
        tickerName: ticker,
        checked: ticker === defaultSelectecdTicker ? true : false,
    }
});

const TickersCheckboxDropdown = (props)=> {
    const [selectedTickers, setSelectedTickers] = useState([defaultSelectecdTicker]);
    const [allChecked, setAllChecked] = useState(false);
    const [allUsdtChecked, setAllUsdtChecked] = useState(false);
    const [allBtcChecked, setAllBtcChecked] = useState(false);
    const coinSetter = { USDT: setAllUsdtChecked, BTC: setAllBtcChecked };
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

    React.useEffect(() => {
        setSelectedTickers([...availableTickers.filter(ticker=>ticker.checked).map(ticker=>ticker.tickerName)]);
    }, [setSelectedTickers]);

    const handleSelectedTickersOnClick = (checked, selectedTicker) => {
        availableTickers.filter(ticker => ticker.tickerName===selectedTicker.tickerName)[0].checked = checked
        if(!availableTickers.some(ticker=>!ticker.checked))
            setAllChecked(true);
        if(checked){
            setSelectedTickers([...selectedTickers, selectedTicker.tickerName]);
        } else {
            setAllChecked(false);
            selectedTickers.splice(selectedTickers.indexOf(selectedTicker.tickerName), 1);
            setSelectedTickers([...selectedTickers]);
        }
    }

    const handleSelectAllOnClick = (checked) => {
        Object.values(coinSetter).forEach(setter => setter(false));
        setAllChecked(checked);
        availableTickers.forEach(ticker => {
            ticker.checked = checked
        });
        if(checked) {
            setSelectedTickers([...availableTickers.map(ticker=>ticker.tickerName)]);
        } else {
            setSelectedTickers([]);
        }
    }

    const handleSelectAllByCoinOnClick = (checked, coin) => {
        Object.entries(coinSetter).forEach((entry) =>{ entry[1](entry[0] === coin) });
        if(checked) {
            setAllChecked(false);
            const selectedTickersByCoin = [];
            availableTickers.forEach( ticker => {
                ticker.checked = false;
                if(ticker.tickerName.split("-")[1] === coin){
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
            <div className="dropdown">

            <div className="btn-group" role="group">
                
                <button className= { dropdownButtonClassName } type="button" id="dropdownMenuButton"
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
                                <input className="form-check-input" type="checkbox" value="" id="selectAllTickersId"
                                    checked = { allChecked }
                                    onChange={(event)=>{ handleSelectAllOnClick(event.target.checked) }}
                                />
                                <label className="form-check-label" htmlFor="selectAllTickersId">Select All</label>
                            </div>
                        </a>
                    </li>
                    <li>
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
                    </li>
                    <li><hr className="dropdown-divider"/></li>
                    { availableTickers.map(option => 
                        <li key= { option.tickerName } >
                            <a className="dropdown-item" href="/#">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="checkTickerId"
                                        checked = { option.checked }
                                        onChange = { (event)=>{
                                            handleSelectedTickersOnClick(event.target.checked, option);
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="checkTickerId">{ option.tickerName }</label>
                                </div>
                            </a>
                        </li>)
                    }
                </ul></div>
                </div>
            
        </>
    )
}

export default TickersCheckboxDropdown
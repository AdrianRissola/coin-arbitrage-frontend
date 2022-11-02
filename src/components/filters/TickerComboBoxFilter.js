import { useState } from "react";

const TickerComboBoxFilter = (props)=> {
    const currentTickerSelected = props.currentTickerSelected ? props.currentTickerSelected : "ALL";
    const [selectedTicker, setSelectedTicker] = useState(currentTickerSelected);
    const darkMode = props.darkMode;
    const tickers = props.tickers;
    const onClickFunction = props.onClickFunction;
    const buttonClassName = darkMode ? "btn btn-secondary dropdown-toggle text-white bg-dark" : "btn btn-secondary dropdown-toggle";
    const buttonStyle = !darkMode ? {
            backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
        } : { backgroundColor: null, color: null }
    buttonStyle.width = "175px"

    return(
        <>
            <div className="dropdown">
                <button className={ buttonClassName }
                    style={ buttonStyle }
                    type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    { "Ticker: " + selectedTicker }
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {tickers.map(ticker => {
                        return (
                            <button className="dropdown-item" type="button" key={ticker}
                                onClick={ ()=>{onClickFunction(ticker); setSelectedTicker(ticker)} }>
                                { ticker }
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default TickerComboBoxFilter
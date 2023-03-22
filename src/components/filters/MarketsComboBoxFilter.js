import React, { useState } from "react";
import { getMarkets } from "../../service/MarketService"


const CheckboxDropdown = (props)=> {
    const [availableMarkets, setAvailableMarkets] = useState([]);
    const marketsFilter = props.marketsFilter;
    const buttonText = props.buttonText;
    const onClickFunction = props.onClickFunction;
    const darkMode = props.darkMode;
    const buttonClassName = darkMode ? "btn btn-secondary dropdown-toggle text-white bg-dark" : "btn btn-secondary dropdown-toggle";
    const buttonStyle = !darkMode ? {
            backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
        } : { backgroundColor: null, color: null }

    const handleSelectedMarketsOnClick = (checked, selectedMarket) => {
        if(checked){
            onClickFunction([...marketsFilter, selectedMarket]);
        } else {
            marketsFilter.splice(marketsFilter.indexOf(selectedMarket), 1)
            onClickFunction([...marketsFilter]);
        }
    }

    React.useEffect(() => {
        getMarkets().then(
            response => {
                console.log("HistoricalView.getAllMarkets:", response);
                const marketNames = response.data.map(market => market.name);
                setAvailableMarkets(marketNames.sort());
                onClickFunction([...marketNames]);
            }
        );
    }, [onClickFunction]);

    return(
        <>
            <div className="dropdown">
                <button className= {buttonClassName} type="button" id="dropdownMenuButton"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={ buttonStyle }>
                    { buttonText }
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    { availableMarkets.map(option => 
                        <li key= { option }>
                            <a className="dropdown-item" href="/#">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="Checkme2"
                                        defaultChecked={ true }
                                        onChange={(event)=>{ handleSelectedMarketsOnClick(event.target.checked, option) }}
                                    />
                                    <label className="form-check-label" htmlFor="Checkme2">{ option }</label>
                                </div>
                            </a>
                        </li>)
                    }
                </ul>
            </div>
        </>
    )
}

export default CheckboxDropdown
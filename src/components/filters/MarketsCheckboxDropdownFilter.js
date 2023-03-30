import React, { useState } from "react";

const availableMarkets = JSON.parse(localStorage.getItem("marketsCheckboxDropdown")).map(market => {
    return {
        marketName: market,
        checked: true,
    }
});

const MarketsCheckboxDropdown = (props)=> {
    const [check, setCheck] = useState(true);
    const marketsFilter = props.marketsFilter;
    const buttonText = props.buttonText;
    const onClickFunction = props.onClickFunction;
    const darkMode = props.darkMode;
    const buttonClassName = darkMode ? "btn btn-secondary dropdown-toggle text-white bg-dark" : "btn btn-secondary dropdown-toggle";
    const buttonStyle = !darkMode ? {
        backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
    } : { backgroundColor: null, color: null };

    React.useEffect(() => {
        onClickFunction([...availableMarkets.map(market=>market.marketName)]);
    }, [onClickFunction]);

    const handleSelectedMarketsOnClick = (checked, selectedMarket) => {
        availableMarkets.filter(market => market.marketName===selectedMarket.marketName)[0].checked = checked
        if(!availableMarkets.some(market=>!market.checked))
            setCheck(true);
        if(checked){
            onClickFunction([...marketsFilter, selectedMarket.marketName]);
        } else {
            setCheck(false);
            marketsFilter.splice(marketsFilter.indexOf(selectedMarket.marketName), 1);
            onClickFunction([...marketsFilter]);
        }
    }

    const handleSelectAllOnClick = (checked) => {
        setCheck(checked);
        availableMarkets.forEach(market => {
            market.checked = checked
        });
        if(checked) {
            onClickFunction([...availableMarkets.map(market=>market.marketName)]);
        } else {
            onClickFunction([]);
        }
    }

    return(
        <>
            <div className="dropdown">
                <button className= {buttonClassName} type="button" id="dropdownMenuButton"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={ buttonStyle }>
                    { buttonText }
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li>
                        <a className="dropdown-item" href="/#">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="selectAllMarketsId"
                                    checked = { check }
                                    onChange={(event)=>{ handleSelectAllOnClick(event.target.checked) }}
                                />
                                <label className="form-check-label" htmlFor="selectAllMarketsId">Select All</label>
                            </div>
                        </a>
                    </li>
                    <li><hr className="dropdown-divider"/></li>
                    { availableMarkets.map(option => 
                        <li key= { option.marketName }>
                            <a className="dropdown-item" href="/#">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="checkMarketId"
                                        checked = { option.checked }
                                        onChange = {(event)=>{
                                            handleSelectedMarketsOnClick(event.target.checked, option);
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="checkMarketId">{ option.marketName }</label>
                                </div>
                            </a>
                        </li>)
                    }
                </ul>
            </div>
        </>
    )
}

export default MarketsCheckboxDropdown
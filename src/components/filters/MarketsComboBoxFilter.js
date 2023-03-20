import { useState } from "react";

const ComboBoxFilter = (props)=> {
    const [selectedOption, setSelectedOption] = useState(props.currentSelection);
    const buttonText = props.buttonText;
    const options = props.options;
    const onClickFunction = props.onClickFunction;
    const darkMode = props.darkMode;
    const buttonClassName = darkMode ? "btn btn-secondary dropdown-toggle text-white bg-dark" : "btn btn-secondary dropdown-toggle";
    const buttonStyle = !darkMode ? {
            backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
        } : { backgroundColor: null, color: null }

    return(
        <>
            <div className="input-group mb-3">
                <div className="dropdown">
                
                    <button className={ buttonClassName }
                        style={ buttonStyle }
                        type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        { `${buttonText} ${selectedOption}` }
                    </button>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {options.map(option => {
                            return (
                                <button className="dropdown-item" type="button" key={option}
                                    onClick={ ()=>{onClickFunction(option); setSelectedOption(option)} }>
                                    { option }
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className="input-group mb-3">
            <div className="dropdown">
                <button className={ buttonClassName }
                    style={ buttonStyle }
                    type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    { `${buttonText} ${selectedOption}` }
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {options.map(option => {
                        return (
                            <button className="dropdown-item" type="button" key={option}
                                onClick={ ()=>{onClickFunction(option); setSelectedOption(option)} }>
                                { option }
                            </button>
                        )
                    })}
                </div>
            </div>
            </div>
        </>
    )
}

export default ComboBoxFilter
import { useState } from "react";

const upwardsArrowUnicode = '\u2191';
const downwardsArrowUnicode = '\u2193';

const getButtonText = (buttonText, selectedOption) =>
    `${buttonText} ${selectedOption.label} ${selectedOption.value==="DESC" ? upwardsArrowUnicode : downwardsArrowUnicode}`;

const SplitButtonComboBox = (props)=> {
    const [selectedOption, setSelectedOption] = useState(props.currentSelection);
    const buttonText = props.buttonText;
    const options = props.options;
    const optionOnClickFunction = props.optionOnClickFunction;
    const buttonOnClickFunction = props.buttonOnClickFunction;
    const darkMode = props.darkMode;
    const primaryButtonStyle = !darkMode ? {
            backgroundColor: "#E9ECEF", color: "black", border: "0px", height: "38px"
        } : { backgroundColor: null, color: null }
    const secondaryButtonClassName = 
        darkMode ? 
            "btn btn-dark dropdown-toggle dropdown-toggle-split" 
            : "btn btn-#E9ECEF dropdown-toggle dropdown-toggle-split";


    return(
        <>
            <div className="btn-group">
            
                <button type="button" className="btn btn-dark" style={ primaryButtonStyle }
                    onClick={
                        ()=>{
                            buttonOnClickFunction({
                                key: selectedOption.key,
                                value: selectedOption.value === "ASC" ? "DESC" : "ASC",
                                label: selectedOption.label
                            });
                            setSelectedOption({
                                key: selectedOption.key,
                                value: selectedOption.value === "ASC" ? "DESC" : "ASC",
                                label: selectedOption.label
                            });
                        } 
                    }>
                    { getButtonText(buttonText, selectedOption) }
                </button>
                <button type="button" className={ secondaryButtonClassName } data-toggle="dropdown"
                    style={ primaryButtonStyle }
                    aria-haspopup="true" aria-expanded="false">
                    <span className="sr-only">Toggle Dropdown</span>
                </button>
                <div className="dropdown-menu">
                    {   
                        options.map(option => {
                            return (
                                <button className="dropdown-item" type="button" key={option.key}
                                    onClick={ ()=>{optionOnClickFunction(option); setSelectedOption(option)} }>
                                    { option.label }
                                </button>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default SplitButtonComboBox
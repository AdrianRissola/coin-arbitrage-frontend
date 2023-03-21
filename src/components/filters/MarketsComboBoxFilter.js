
const CheckboxDropdown = (props)=> {
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
            <div className="dropdown">
                <button className= {buttonClassName} type="button" id="dropdownMenuButton"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={ buttonStyle }>
                    { buttonText }
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    { options.map(option => 
                        <li key= { option }>
                            <a className="dropdown-item" href="/#">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="Checkme2"
                                        defaultChecked={ true }
                                        onChange={(event)=>{ onClickFunction(event.target.checked, option) }}
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
import { useState } from "react";

const CheckboxDropdown = (props)=> {
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
<div className="dropdown">
    <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Checkbox dropdown
    </button>
    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <li>
            <a className="dropdown-item" href="#">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="Checkme1" onChange={e => {}}/>
                    <label className="form-check-label" htmlFor="Checkme1">Check me</label>
                </div>
            </a>
        </li>
        <li>
            <a className="dropdown-item" href="#">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="Checkme2" checked onChange={e => {}}/>
                    <label className="form-check-label" htmlFor="Checkme2">Check me</label>
                </div>
            </a>
        </li>
        <li>
            <a className="dropdown-item" href="#">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="Checkme3" onChange={e => {}}/>
                    <label className="form-check-label" htmlFor="Checkme3">Check me</label>
                </div>
            </a>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
            <a className="dropdown-item" href="#">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="Checkme4" checked onChange={e => {}}/>
                    <label className="form-check-label" htmlFor="Checkme4">Check me</label>
                </div>
            </a>
        </li>
    </ul>
</div>
        </>
    )
}

export default CheckboxDropdown
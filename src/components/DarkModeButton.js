const DarkModeButton = (props)=> {
    const darkMode = props.darkMode
    const buttonClassName = darkMode ? "btn btn-light" : "btn btn-dark";
    const iClassName = darkMode ? "fa fa-sun-o" : "fa fa-moon-o";
    const buttonText = darkMode ? "| Light" : "| Dark";

    return(
        <button className={buttonClassName}  onClick={()=>{props.darkModeSetFunction(!darkMode)}}>
            <i className={iClassName} style={{fontSize:"20px" }}></i> {buttonText}
        </button>
    )
}

export default DarkModeButton
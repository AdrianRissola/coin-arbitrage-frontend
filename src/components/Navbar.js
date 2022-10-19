const Navbar = (props)=> {
    const darkMode = props.darkMode;
    const brandFunction = props.brandFunction;
    const arbitrageFunction = props.arbitrageFunction;
    const bestArbitrageFunction = props.bestArbitrageFunction;
    const historicalFunction = props.historicalFunction;
    const darkModeButton = props.darkModeButton;
    const marketsFunction = props.marketsFunction;

    return(
        <nav className={"navbar navbar-expand-sm " + (darkMode ? "bg-dark navbar-dark" : "bg-light navbar-light")}>
            <a className="navbar-brand" href="#" onClick={ brandFunction } >
                <b><i>Real Time Arbitrage Monitor</i></b>
            </a>
            <ul className="navbar-nav">
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                        Monitor
                    </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#" onClick={ arbitrageFunction } >
                            All Arbitrage
                        </a>
                        <a className="dropdown-item" href="#" onClick={ bestArbitrageFunction }>
                            Best Arbitrage
                        </a>
                    </div>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" onClick={ historicalFunction } >
                        Historical
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" onClick={ marketsFunction } >
                        Markets
                    </a>
                </li>
                <li className="nav-item right" style={{right:"10px"}}>
                    <darkModeButton.component darkMode = {darkModeButton.darkMode} darkModeSetFunction = {darkModeButton.darkModeSetFunction}/>
                </li>
            </ul>
        </nav>    
    )
}

export default Navbar
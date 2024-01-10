const Navbar = (props)=> {
    const darkMode = props.darkMode;
    const brandFunction = props.brandFunction;
    const arbitrageFunction = props.arbitrageFunction;
    const bestArbitrageFunction = props.bestArbitrageFunction;
    const historicalFunction = props.historicalFunction;
    const darkModeButton = props.darkModeButton;
    const marketsFunction = props.marketsFunction;

    return(
        <nav className={"navbar navbar-expand-md " + (darkMode ? "bg-dark navbar-dark" : "navbar-light")}
            style={{ backgroundColor: !darkMode ? "#E9ECEF" : null, padding:".5rem 1rem"}}>
            
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <a className="navbar-brand" href="/#" onClick={ brandFunction } 
            style={{fontSize:"15px", textAlign:"center", padding:"0px", margin: "auto"}}>
                <b><i>Real-Time<br/>Arbitrage Monitor</i></b>
            </a>
            <ul className="navbar-nav mr-auto">
                <li className="nav-item right" style={{right:"10px"}}>
                    <darkModeButton.component darkMode = {darkModeButton.darkMode}
                    darkModeSetFunction = {darkModeButton.darkModeSetFunction}/>
                </li>
            </ul>
            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{marginLeft:"25px"}}>
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="/#" id="navbardrop" data-toggle="dropdown">
                            Monitor
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/#" onClick={ arbitrageFunction } >
                                All Arbitrage
                            </a>
                            <a className="dropdown-item" href="/#" onClick={ bestArbitrageFunction }>
                                Best Arbitrage
                            </a>
                        </div>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/#" onClick={ historicalFunction } >
                            Historical
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/#" onClick={ marketsFunction } >Markets</a>
                    </li>
                </ul>
            </div>   
        </nav>    
    )
}

export default Navbar
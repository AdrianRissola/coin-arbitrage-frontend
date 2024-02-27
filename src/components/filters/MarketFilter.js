const MarketFilter = (props)=> {
    const darkMode = props.darkMode;
    const marketFilterSetFunction = props.marketFilterSetFunction;
    const marketFilter = props.marketFilter;

    const className = darkMode ? "input-group-text text-white bg-dark" : "input-group-text";

    return(
        <>                  
            {/* <label style={{verticalAlign:"middle", alignSelf:"center", fontSize:"20px", fontWeight:"bolder", fontStyle:"italic"}}>
                Filters:&nbsp;</label> */}
            <div className="input-group-prepend">
                <span className= {className} id="basic-addon3">Market</span>
            </div>
            <input 
                className="form-control" 
                id="markets" 
                aria-describedby="basic-addon3" 
                value={marketFilter}
                onChange={evt => marketFilterSetFunction(evt.target.value)}
            />            
        </>
    )
}

export default MarketFilter
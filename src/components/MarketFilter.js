const MarketFilter = (props)=> {
    const marketFilterSetFunction = props.marketFilterSetFunction;
    const marketFilter = props.marketFilter;

    return(
        <>
            <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">Markets</span>
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
const MinProfitFilter = (props)=> {
    const darkMode = props.darkMode;

    const minProfitFilterSetFunction = props.minProfitFilterSetFunction;
    const minProfitFilter = props.minProfitFilter;

    const className = darkMode ? "input-group-text text-white bg-dark" : "input-group-text";

    return(
        <>
          <div className="input-group-prepend">
            <span className= {className} id="basic-addon3">Min Profit %</span>
          </div>
          <input 
            type="number" 
            min="0" 
            step="0.01"
            value={minProfitFilter}
            onChange={evt => minProfitFilterSetFunction(evt.target.value)}
            className="form-control" 
            id="minProfit" 
            aria-describedby="basic-addon3"
          />
        </>
    )
}

export default MinProfitFilter
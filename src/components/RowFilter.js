const RowFilter = (props)=> {
    const minProfitFilterSetFunction = props.filters;
    const minProfitFilter = props.minProfitFilter;

    return(
        <>
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon3">Min Profit %</span>
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

export default RowFilter
const HistoricalView = (props)=> {
    const title = props.title
    const filters = props.filters
    const currentWsResponse = props.currentWsResponse;
    const arbitrageList = props.arbitrageList;

    return(
        <>
            { currentWsResponse.channel==="Historical" ?
                <>
                    { title }
                    { filters }
                    <div className="row">
                        <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
                            { arbitrageList }
                        </div>
                    </div>
                </>
                : 
                null
            }
        </>
    )
}

export default HistoricalView
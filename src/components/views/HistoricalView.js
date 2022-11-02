const HistoricalView = (props)=> {
    const title = props.title
    const filters = props.filters
    const currentWsResponse = props.currentWsResponse;
    const arbitrageListComponent = props.arbitrageListComponent;

    return(
        <>
            { currentWsResponse.channel==="Historical" ?
                <>
                    { title }
                    { filters }
                    <div className="row">
                        <div className="col-sm-12" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
                            { arbitrageListComponent }
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
const MarketStatusView = (props)=> {
    const title = props.title
    const currentWsResponse = props.currentWsResponse
    const marketStatusComponent = props.marketStatusComponent;

    return(
        <>
            { currentWsResponse.channel==="Markets" ?
                <>
                    { title }
                    <div className="row">
                        <div className="col-sm-4" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                            { marketStatusComponent }
                        </div>
                    </div>
                </>
                :
                null
            }
        </>
    )
}

export default MarketStatusView
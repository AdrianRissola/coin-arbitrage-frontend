const BestArbitrageView = (props)=> {
    const title = props.title
    const currentWsResponse = props.currentWsResponse;
    const arbitrageComponent = props.arbitrageComponent;
    const marketStatusComponent = props.marketStatusComponent;

    return(
        <>
            { currentWsResponse.ticker === "ALL" ?
                <>
                    { title }
                    <div className="row">
                        <div className="col-sm-3" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                            { arbitrageComponent }
                        </div>
                        <div className="col-4" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
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

export default BestArbitrageView
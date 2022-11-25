const BestArbitrageView = (props)=> {
    const title = props.title
    const currentWsResponse = props.currentWsResponse;
    const arbitrageComponent = props.arbitrageComponent;
    const marketStatusComponent = props.marketStatusComponent;
    const marketPrices = props.marketPrices;

    return(
        <>
            { currentWsResponse.ticker === "ALL" ?
                <>
                    { title }
                    <br/>
                    <div className="row">
                        <div  
                            style={{display: "flex", flexDirection: "row", flexWrap: "wrap", marginLeft: "2rem"}}>
                            { arbitrageComponent }
                        </div>
                        <div  
                            style={{flexDirection: "row", flexWrap: "wrap", marginLeft: "2.5rem"}}>
                            { marketPrices }
                        </div>
                        <div  
                            style={{display: "flex", flexDirection: "row", flexWrap: "wrap", marginLeft: "2rem"}}>
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
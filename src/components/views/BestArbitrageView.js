const BestArbitrageView = (props)=> {
    const title = props.title
    const menuSelection = props.menuSelection;
    const arbitrageComponent = props.arbitrageComponent;
    const marketStatusComponent = props.marketStatusComponent;
    const marketPrices = props.marketPrices;

    return(
        <>
            { menuSelection.channelSubscription?.ticker?.toUpperCase() === "ALL" ?
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
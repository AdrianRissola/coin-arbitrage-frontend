const BestArbitrageView = (props)=> {
    const arbitrageComponent = props.arbitrageComponent;
    const marketStatusComponent = props.marketStatusComponent;
    const marketPrices = props.marketPrices;

    return(
        <>
            <div className="row">
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Best Arbitrage
                    </h1>
                </div>
            </div>
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
    )
}

export default BestArbitrageView
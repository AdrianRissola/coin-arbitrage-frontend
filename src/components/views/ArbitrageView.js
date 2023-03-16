const leftScroll = (id) => {
    const left = document.querySelector("#"+id);
    left.scrollBy(200, 0);
}
  
  const rightScroll = (id) => {
    const right = document.querySelector("#"+id);
    right.scrollBy(-200, 0);
}

const ArbitrageView = (props)=> {
    const filters = props.filters;
    const usdtTickerButtons = props.usdtTickerButtons;
    const btcTickerButtons = props.btcTickerButtons;
    const marketsArbitrageComponent = props.marketsArbitrageComponent;
    const marketPrices = props.marketPrices;

    return(
        <>
            <div className="row">
                <div className="col-10">
                <div className="cover" >
                    <button className="left" onClick={ ()=>{rightScroll("USDT")} } >
                        <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                    </button>
                    <div className="scroll-images" id="USDT">
                        { usdtTickerButtons }
                    </div>
                    <button className="right" onClick={ ()=>{leftScroll("USDT")} } 
                    style={{marginRight: "-20px"}}
                    >
                        <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                    </button>
                </div>
                </div>
            </div>
            <div className="row">
                <div className="col-10">
                <div className="cover">
                    <button className="left" onClick={ ()=>{rightScroll("BTC")} }>
                    <i className='fa fa-angle-double-left' style={{fontSize:"38px"}}></i>
                    </button>
                    <div className="scroll-images" id="BTC">
                        {btcTickerButtons}
                    </div>
                    <button className="right" onClick={ ()=>{leftScroll("BTC")} } style={{marginRight: "-20px"}}>
                    <i className='fa fa-angle-double-right' style={{fontSize:"38px"}}></i>
                    </button>
                </div>
                </div>
            </div>
            <div className="row">
                <div className="col" style={{textAlign: "center"}}>
                    <h1 style={{width:"1300px", fontWeight: 'bold', fontSize:"2.5rem"}}>
                        Arbitrage
                    </h1>
                </div>
            </div>
            { filters }
            <div className="row">
                <div className="col-sm-9" style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}> 
                    { marketsArbitrageComponent }
                </div>
                <div className="col-3" style={{verticalAlign:"top"}}>
                    { marketPrices }
                </div>
            </div>
        </>
    )
}

export default ArbitrageView
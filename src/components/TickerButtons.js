const TickerButtons = (props) => {
    const tickers = props.tickers
    const HandleChangeTickerSubscriptionClick = props.HandleChangeTickerSubscriptionClick
    return tickers.map(ticker=>{
      return (
        <button className="btn btn-dark" key={ticker}
          style={{marginRight: '0.3rem', marginTop: '0.3rem',  fontSize:'90%'}} 
          onClick={()=>{HandleChangeTickerSubscriptionClick(ticker)}}>
          {ticker}
        </button>
      )
    })
}

export default TickerButtons
const TickerButtons = (props) => {
    const tickers = props.tickers
    const HandleChangeTickerSubscriptionClick = props.HandleChangeTickerSubscriptionClick
    const btnClassName = props.darkMode ? "btn btn-dark" : "btn btn-light"
    return tickers.map(ticker => {
      return (
        <button className={btnClassName} key={ticker.name}
          title={ticker.description}
          style={{marginRight: '0.3rem', marginTop: '0.3rem',  fontSize:'90%'}} 
          onClick={()=>{HandleChangeTickerSubscriptionClick(ticker.name)}}>
          {ticker.name}
        </button>
      )
    })
}

export default TickerButtons
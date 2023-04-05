const TickerButtons = (props) => {
    const tickers = props.tickers.sort((t1, t2) => (t1.name > t2.name) ? 1 : ((t2.name > t1.name) ? -1 : 0))
    const handleChangeChannelSubscriptionClick = props.handleChangeChannelSubscriptionClick
    const btnClassName = props.darkMode ? "btn btn-dark" : "btn btn-light"
    const backgroundColor = !props.darkMode ? "#E9ECEF" : null
    
    return tickers.map(ticker => {
      return (
        <button className={btnClassName} key={ticker.name}
          title={ticker.description}
          style={{whiteSpace:'nowrap', marginRight: '0.3rem', marginTop: '0.3rem',  fontSize:'90%', backgroundColor:backgroundColor}} 
          onClick={()=>{handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker: ticker.name})}}>
          {ticker.name}
        </button>
      )
    })
}

export default TickerButtons
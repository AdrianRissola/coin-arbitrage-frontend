import { Tooltip } from "@mui/material";
import React from "react";

const TickerButtons = (props) => {
    const tickers = props.tickers.sort((t1, t2) => (t1.name > t2.name) ? 1 : ((t2.name > t1.name) ? -1 : 0))
    const handleChangeChannelSubscriptionClick = props.handleChangeChannelSubscriptionClick
    const btnClassName = props.darkMode ? "btn btn-dark" : "btn btn-light"

    return tickers.map(ticker => {
      return (
        <React.Fragment key={ ticker.name }>
          <input onClick={ ()=>{ handleChangeChannelSubscriptionClick({channel: 'arbitrage', ticker: ticker.name}) } } 
            type="radio" className="btn-check" name="btnradioTciker" defaultChecked={ticker.name==='BTC-USDT' ? true : false}
            id={ticker.name} autoComplete="off"
          />
          <Tooltip title={ticker.description} placement="bottom" arrow>
            <label className={btnClassName} htmlFor={ticker.name}
              style={{whiteSpace:'nowrap', marginRight: '0.3rem', marginTop: '0.3rem'}}>
              {ticker.name}
            </label>
          </Tooltip>
        </React.Fragment>
      )
    })
}

export default TickerButtons
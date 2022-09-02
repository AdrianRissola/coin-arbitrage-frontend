import React from 'react'
import {pad} from '../utils'


const MarketPrices = (props)=> {
    const marketPrices = props.marketPrices
    return(
        <table className="table" 
        style={{width: "300px", borderStyle:'solid', borderColor:"blue", marginLeft:"2rem"}}>
        <thead>
          <tr>
            <th>Market</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {
            marketPrices.map(marketPrice => {
              return (
                <tr key={marketPrice.market}>
                  <td style={{ textAlign:"left", fontWeight: 'bold' }}>{ marketPrice.market }</td>
                  <td style={{ textAlign:"right", fontWeight: 'bold' }}>{ marketPrice.price.toLocaleString(navigator.language, {maximumFractionDigits:4}) }</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    )
}

export default MarketPrices
import React from 'react'
import {pad} from '../utils'


const MarketPrices = (props)=> {
    const ticker = props.ticker
    const marketPrices = props.marketPrices
    return(
        <table className="table" 
            style={{width: "300px", borderStyle:'solid', borderColor:"purple", marginLeft:"2rem"}}>
            <thead>
                <tr>
                    <th>{ticker.split('-')[0]} Markets ({props.marketPrices.length})</th>
                    <th>Price ({ticker.split('-')[1]})</th>
                </tr>
            </thead>
            <tbody>
                {
                    marketPrices.map(marketPrice => {
                        return (
                            <tr key={marketPrice.market}>
                                <td style={{ textAlign:"left", fontWeight: 'bold' }}>{ marketPrice.market }</td>
                                <td style={{ color:'green', textAlign:"right", fontWeight: 'bold' }}>{ marketPrice.price }</td>
                            </tr>
                        );
                    })
                }
            </tbody>
      </table>
    )
}

export default MarketPrices
import { useState } from "react";


const MarketPrices = (props)=> {
    const [order, setOrder] = useState(false);
    const ticker = props.ticker
    const marketPrices = order ? props.marketPrices.sort((a,b)=>a.price - b.price) : props.marketPrices
    return(
        
        <table className="table" style={{width: "300px", borderStyle:'solid', borderColor:"purple", marginLeft:"2rem"}}>
            <thead>
                <tr>
                    <th></th>
                    <th style={{ textAlign:"center", padding: '0rem'}}>
                        <input
                            type="checkbox" className="form-check-input" id="sortCheck"
                            onClick={ evt => {setOrder(evt.target.checked)} }
                        />
                        <label className="form-check-label" htmlFor="sortCheck">Sort down</label>
                    </th>
                </tr>
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
                                <td style={{ color:'green', textAlign:"right", fontWeight: 'bold' }} title={marketPrice.price}>
                                    { marketPrice.price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                                </td>
                            </tr>
                        );
                    })
                }
            </tbody>
      </table>
    )
}

export default MarketPrices
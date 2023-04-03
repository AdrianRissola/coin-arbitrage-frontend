import { useState } from "react";
import { marketPricesCardStyle } from "../styleUtil";

const greenHex = "#0ecb81"

const MarketPrices = (props)=> {
    const [order, setOrder] = useState(false);
    const ticker = props.ticker  || 'coin-coin'
    const marketPrices = order ? props.marketPrices.sort((a,b)=>a.price - b.price) : props.marketPrices
    const styles = marketPricesCardStyle(props.darkMode)
    const textColor = props.darkMode ? "white" : "black";

    return(
        <div className={styles.cardClassName} style={styles.cardStyle}>
            <div className={styles.cardBodyClassName}>
                <table className="table" style={{ color: textColor}}>
                    <thead>
                        <tr>
                            <th></th>
                            <th style={{ textAlign:"center", padding: '0rem'}}>
                                <input
                                    type="checkbox" className="form-check-input" id="sortCheck"
                                    onClick={ evt => {setOrder(evt.target.checked)} }
                                />
                                <label className="form-check-label" htmlFor="sortCheck" style={{fontSize:"20px"}}>&#x2191;&#x2193;</label>
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
                                        <td style={{ color:greenHex, textAlign:"right", fontWeight: 'bold' }} title={marketPrice.price}>
                                            { marketPrice.price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>      
    )
}

export default MarketPrices
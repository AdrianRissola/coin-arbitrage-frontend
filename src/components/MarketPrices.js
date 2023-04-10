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
                { props.marketPrices ?
                    <table className="table" style={{ color: textColor}}>
                        <thead>
                            <tr>
                                <th className="text-center" style={{fontSize:"18px"}}>Prices</th>
                                <th>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"
                                            onClick={ evt => {setOrder(evt.target.checked)} }
                                        />
                                        <label style={{fontSize:"18px"}}>
                                            &#x2191;&#x2193;
                                        </label>
                                    </div>
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
                    : null
                }
            </div>
        </div>      
    )
}

export default MarketPrices
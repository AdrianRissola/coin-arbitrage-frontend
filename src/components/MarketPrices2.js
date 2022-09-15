import { useState } from "react";
import { marketPricesCardStyle } from "../styleUtil";

const greenHex = "#0ecb81"

const MarketPrices = (props)=> {
    const [order, setOrder] = useState(false);
    const ticker = props.ticker
    const marketPrices = order ? props.marketPrices.sort((a,b)=>a.price - b.price) : props.marketPrices
    const styles = marketPricesCardStyle(props.darkMode)

    return(
        <div className={styles.cardClassName} style={styles.cardStyle}>
            <div className={styles.cardBodyClassName}>
                
                        <div className="row">
                            <div className="col" style={{ textAlign:"center", padding: '0rem'}}>
                                <input
                                    type="checkbox" className="form-check-input" id="sortCheck"
                                    onClick={ evt => {setOrder(evt.target.checked)} }
                                />
                                <label className="form-check-label" htmlFor="sortCheck">Sort down</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">{ticker.split('-')[0]} Markets ({props.marketPrices.length})</div>
                            <div className="col">Price ({ticker.split('-')[1]})</div>
                        </div>
                        {
                            marketPrices.map(marketPrice => {
                                return (
                                    <div className="row" key={marketPrice.market}>
                                        <div className="col" style={{ textAlign:"left", fontWeight: 'bold' }}>{ marketPrice.market }</div>
                                        <div className="col" style={{ color:greenHex, textAlign:"right", fontWeight: 'bold' }} title={marketPrice.price}>
                                            { marketPrice.price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                                        </div>
                                    </div>
                                );
                            })
                        }
            </div>
        </div>      
    )
}

export default MarketPrices
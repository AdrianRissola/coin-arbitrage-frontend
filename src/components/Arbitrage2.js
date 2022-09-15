import React from 'react'
import { arbitrageCardStyle } from '../styleUtil'

const greenHex = "#0ecb81"


const Arbitrage = (props)=> {
    const ticker = props.ticker
    const header = props.header
    const isBestArbitrage = header.toLowerCase() === "best arbitrage"
    const displayedArbitrage = props.arbitrage
    const darkCardMode = props.darkMode

    let styles = isBestArbitrage ? arbitrageCardStyle("40px", darkCardMode) : arbitrageCardStyle("20px", darkCardMode)

    const getHeader = (header) => { return(
        <div className={styles.cardHeaderClassName} style={{ color: isBestArbitrage ? greenHex: null}}>
            <b>{header}</b>
        </div>
    )}
    

    return(
        <div className={styles.cardClassName} style={styles.cardStyle}>
            { getHeader(header) }
            <div className={styles.cardBodyClassName}>
                        <div className="row" style={{padding:"10px"}}>
                            <div className="col" style={{maxWidth: "110px"}}>Operation</div>
                            <div className="col" style={{maxWidth: "80px"}}>Market</div>
                            <div className="col">Price</div>
                        </div>
                        <div className="row">
                            <div className="col" align="center">{displayedArbitrage.transactions[0].type}</div>             
                            <div className="col">{displayedArbitrage.transactions[0].market}</div>
                            <div className="col" align="center" style={{color:greenHex}} title={displayedArbitrage.transactions[0].price}>
                                { displayedArbitrage.transactions[0].price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col" align="center">{displayedArbitrage.transactions[1].type}</div>
                            <div className="col">{displayedArbitrage.transactions[1].market}</div>
                            <div className="col" align="center" style={{color:greenHex}} title={displayedArbitrage.transactions[1].price}>
                                { displayedArbitrage.transactions[1].price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                            </div>
                        </div>
                        <div className="row">
                            {
                                displayedArbitrage.profitPercentage === 0 ?
                                <div className="col" style = {{fontWeight: 'bold', textAlign:"center", color:'red'}} colSpan="3">
                                    Non Profitable
                                </div>
                                :
                                <>
                                    <div className="col" title={displayedArbitrage.profitPercentage + " %"} style = {{fontWeight: 'bold', textAlign:"center", textDecorationLine: displayedArbitrage.profitPercentage===0?'line-through':'none'}} colSpan="1">
                                        Profit: 
                                    </div>
                                    <div className="col" title={displayedArbitrage.profitPercentage + " %"} style = {{fontWeight: 'bold', textAlign:"center", textDecorationLine: displayedArbitrage.profitPercentage===0?'line-through':'none'}} colSpan="2">
                                        <span style={{color:greenHex}}>{displayedArbitrage.profitPercentage.toLocaleString(navigator.language, {maximumSignificantDigits:3})}% {ticker.split('-')[1]}</span>
                                    </div>
                                </>
                            }
                        </div>
                        <div className="row">
                            {
                                displayedArbitrage.profitPerUnit === 0 ?
                                <div className="col" style = {{fontWeight: 'bold', textAlign:"center",color:'red'}} colSpan="3">
                                    Non Profitable
                                </div>
                                :
                                <>
                                    <div className="col" style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="2" title={displayedArbitrage.profitPerUnit + ' ' + ticker.split('-')[1]}>
                                        Profit per {ticker.split('-')[0]} unit: 
                                    </div>
                                    <div className="col" style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="1" title={displayedArbitrage.profitPerUnit + ' ' + ticker.split('-')[1]}>
                                        <span style={{color:greenHex}}>{displayedArbitrage.profitPerUnit.toLocaleString(navigator.language,{maximumSignificantDigits: 8})} {ticker.split('-')[1]}</span>
                                    </div>
                                </>
                            }
                        </div>
            </div>
        </div>
    )
}

export default Arbitrage
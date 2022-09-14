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
            {getHeader(header)}
            <div className={styles.cardBodyClassName}>
                <table className="table">
                    <tbody>
                        <tr>
                            <td align="center" style={{width: "100px"}}>Operation</td>
                            <td align="center" style={{width: "80px"}}>Market</td>
                            <td align="center">Price</td>
                        </tr>
                        <tr>
                            <td align="center">{displayedArbitrage.transactions[0].type}</td>             
                            <td>{displayedArbitrage.transactions[0].market}</td>
                            <td align="center" style={{color:greenHex}} title={displayedArbitrage.transactions[0].price}>
                                { displayedArbitrage.transactions[0].price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                            </td>
                        </tr>
                        <tr>
                            <td align="center">{displayedArbitrage.transactions[1].type}</td>
                            <td>{displayedArbitrage.transactions[1].market}</td>
                            <td align="center" style={{color:greenHex}} title={displayedArbitrage.transactions[1].price}>
                                { displayedArbitrage.transactions[1].price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            {
                                displayedArbitrage.profitPercentage === 0 ?
                                <td style = {{fontWeight: 'bold', textAlign:"center", color:'red'}} colSpan="3">
                                    Non Profitable
                                </td>
                                :
                                <>
                                    <td title={displayedArbitrage.profitPercentage + " %"} style = {{fontWeight: 'bold', textAlign:"center", textDecorationLine: displayedArbitrage.profitPercentage===0?'line-through':'none'}} colSpan="1">
                                        Profit: 
                                    </td>
                                    <td title={displayedArbitrage.profitPercentage + " %"} style = {{fontWeight: 'bold', textAlign:"center", textDecorationLine: displayedArbitrage.profitPercentage===0?'line-through':'none'}} colSpan="2">
                                        <span style={{color:greenHex}}>{displayedArbitrage.profitPercentage.toLocaleString(navigator.language, {maximumSignificantDigits:3})}% {ticker.split('-')[1]}</span>
                                    </td>
                                </>
                            }
                        </tr>
                        <tr>
                            {
                                displayedArbitrage.profitPerUnit === 0 ?
                                <td style = {{fontWeight: 'bold', textAlign:"center",color:'red'}} colSpan="3">
                                    Non Profitable
                                </td>
                                :
                                <>
                                    <td style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="2" title={displayedArbitrage.profitPerUnit + ' ' + ticker.split('-')[1]}>
                                        Profit per {ticker.split('-')[0]} unit: 
                                    </td>
                                    <td style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="1" title={displayedArbitrage.profitPerUnit + ' ' + ticker.split('-')[1]}>
                                        <span style={{color:greenHex}}>{displayedArbitrage.profitPerUnit.toLocaleString(navigator.language,{maximumSignificantDigits: 8})} {ticker.split('-')[1]}</span>
                                    </td>
                                </>
                            }
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export default Arbitrage
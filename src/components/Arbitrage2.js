import React from 'react'
import {pad} from '../utils'


const Arbitrage = (props)=> {
    const tableStyle = props.tableStyle
    const ticker = props.ticker
    const header = props.header
    const displayedArbitrage = props.arbitrage
    return(
        <table className="table" style={tableStyle}>
            <thead>
                <tr>
                    <th colSpan="3">{header}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td align="center">Operation</td>
                    <td align="center">Market</td>
                    <td align="center">Price</td>
                </tr>
                <tr>
                    <td align="center">{displayedArbitrage.transactions[0].type}</td>             
                    <td>{displayedArbitrage.transactions[0].market}</td>
                    <td style={{color:'green'}}>{ displayedArbitrage.transactions[0].price.toLocaleString(navigator.language, {maximumFractionDigits:4}) }</td>
                </tr>
                <tr>
                    <td align="center">{displayedArbitrage.transactions[1].type}</td>
                    <td>{displayedArbitrage.transactions[1].market}</td>
                    <td style={{color:'green'}}>{ displayedArbitrage.transactions[1].price.toLocaleString(navigator.language, {maximumFractionDigits:4}) }</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="3">
                        Profit: <span style={{color:'green'}}>{displayedArbitrage.profitPercentage.toFixed(3).toLocaleString(navigator.language, {maximumFractionDigits:2})}% {ticker.split('-')[1]}</span>
                    </td>
                </tr>
                <tr>
                    <td style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="3">
                        Profit per {ticker.split('-')[0]}: <span style={{color:'green'}}>{displayedArbitrage.profitPerUnit.toFixed(8).toLocaleString(navigator.language)} {ticker.split('-')[1]}</span>
                    </td>
                </tr>
            </tfoot>
        </table>
    )
}

export default Arbitrage
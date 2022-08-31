import React from 'react'
import {pad} from '../utils'


const Arbitrage = (props)=> {
    const tableStyle = props.tableStyle
    const header = props.header
    const displayedArbitrage = props.arbitrage
    return(
        <table className="table" style={tableStyle}>
            <tr align="center">
                <table className="table" style={{borderRadius: "40px"}}>
                    <thead>
                        <tr>
                            <th colSpan="3">{header}</th>
                        </tr>
                    </thead>
                    <tr>
                        <td align="center">Operation</td>
                        <td align="center">Market</td>
                        <td align="center">Price</td>
                    </tr>
                    <tr>
                        <td align="center">{displayedArbitrage.transactions[0].type}</td>             
                        <td>{displayedArbitrage.transactions[0].market}</td>
                        <td>{ pad(displayedArbitrage.transactions[0].price.toLocaleString(navigator.language, {maximumFractionDigits:2})) }</td>
                    </tr>
                    <tr>
                        <td align="center">{displayedArbitrage.transactions[1].type}</td>
                        <td>{displayedArbitrage.transactions[1].market}</td>
                        <td>{ pad(displayedArbitrage.transactions[1].price.toLocaleString(navigator.language, {maximumFractionDigits:2})) }</td>
                    </tr>
                </table>
            </tr>
            <tr align="center">
                <table className="table">
                    <tr>
                        <td style = {{fontWeight: 'bold', textAlign:"center"}}>
                            Profit: <span style={{color:'green'}}>{displayedArbitrage.profitPercentage.toFixed(3).toLocaleString(navigator.language, {maximumFractionDigits:2})}%</span>
                        </td>
                        <td style = {{fontWeight: 'bold', textAlign:"center"}}>
                            Profit per unit: <span style={{color:'green'}}>{displayedArbitrage.profitPerUnit.toFixed(3).toLocaleString(navigator.language, {maximumFractionDigits:2})}</span>
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
    )
}

export default Arbitrage
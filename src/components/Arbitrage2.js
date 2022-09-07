import React from 'react'

const Arbitrage = (props)=> {
    const tableStyle = props.tableStyle
    const ticker = props.ticker
    const header = props.header
    const displayedArbitrage = props.arbitrage
    return(
        <table className="table" style={tableStyle} >
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
                    <td style={{color:'green'}} title={displayedArbitrage.transactions[0].price}>
                        { displayedArbitrage.transactions[0].price.toLocaleString(navigator.language, {maximumSignificantDigits:7}) }
                    </td>
                </tr>
                <tr>
                    <td align="center">{displayedArbitrage.transactions[1].type}</td>
                    <td>{displayedArbitrage.transactions[1].market}</td>
                    <td style={{color:'green'}} title={displayedArbitrage.transactions[1].price}>
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
                        <td title={displayedArbitrage.profitPercentage + " %"} style = {{fontWeight: 'bold', textAlign:"center", textDecorationLine: displayedArbitrage.profitPercentage===0?'line-through':'none'}} colSpan="3">
                            Profit: <span style={{color:'green'}}>{displayedArbitrage.profitPercentage.toLocaleString(navigator.language, {maximumSignificantDigits:3})}% {ticker.split('-')[1]}</span>
                        </td>
                    }
                </tr>
                <tr>
                    {
                        displayedArbitrage.profitPerUnit === 0 ?
                        <td style = {{fontWeight: 'bold', textAlign:"center",color:'red'}} colSpan="3">
                            Non Profitable
                        </td>
                        :
                        <td style = {{fontWeight: 'bold', textAlign:"center"}} colSpan="3" title={displayedArbitrage.profitPerUnit + ' ' + ticker.split('-')[1]}>
                            Profit per {ticker.split('-')[0]} unit: <span style={{color:'green'}}>{displayedArbitrage.profitPerUnit.toLocaleString(navigator.language,{maximumSignificantDigits: 8})} {ticker.split('-')[1]}</span>
                        </td>
                    }
                </tr>
            </tfoot>
        </table>
    )
}

export default Arbitrage
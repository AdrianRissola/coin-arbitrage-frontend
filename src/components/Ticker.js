import React from 'react'
const Ticker = (props)=> {
    return(
        <>
            <div>{props.marketName}</div>
            <div>{props.pair}</div>
            <div>{props.price}</div>
        </>
    )
}

export default Ticker
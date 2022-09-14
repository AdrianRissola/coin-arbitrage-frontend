const marketPricesDarkCardClassName = "card text-white bg-dark mb-3"
const marketPricesDarkCardStyle = {width: "315px", marginLeft:"1.5rem", borderRadius: "20px"}
const marketPricesDarkCardBodyClassName = "card-body"

exports.marketPricesDarkCardStyle = {
    cardClassName : marketPricesDarkCardClassName,
    cardStyle : marketPricesDarkCardStyle,
    cardBodyClassName : marketPricesDarkCardBodyClassName,
    tableStyle : null
}


const marketPricesCardClassName = null
const marketPricesCardStyle = null
const marketPricesCardBodyClassName = null
const marketPricesTableStyle = {width: "300px", borderStyle:'solid', borderColor:"purple", marginLeft:"2rem"}

exports.marketPricesCardStyle = {
    cardClassName : marketPricesCardClassName,
    cardStyle : marketPricesCardStyle,
    cardBodyClassName : marketPricesCardBodyClassName,
    tableStyle : marketPricesTableStyle
}


const arbitrageDarkCardClassName = "card text-white bg-dark mb-3"
const arbitrageDarkCardStyle = (borderRadius) => {return {
    width: "350px", marginLeft:"1.5rem", borderRadius: borderRadius ? borderRadius : "20px"
}}
const arbitrageDarkCardHeaderClassName = "card-header"
const arbitrageDarkCardBodyClassName = "card-body"

exports.arbitrageDarkCardStyle = (borderRadius) => { return {
    cardClassName : arbitrageDarkCardClassName,
    cardStyle : arbitrageDarkCardStyle(borderRadius),
    cardHeaderClassName : arbitrageDarkCardHeaderClassName,
    cardBodyClassName : arbitrageDarkCardBodyClassName,
    tableStyle : null
}}


const arbitrageTableStyle = {
    borderRadius: "20px", 
    width: "350px", marginLeft: '2rem', 
    marginRight: '-1rem', 
    borderStyle:'solid', borderColor:"#aaaaaa",
}

exports.arbitrageCardStyle = {
    cardClassName : null,
    cardStyle : null,
    cardHeaderClassName : null,
    cardBodyClassName : null,
    tableStyle : arbitrageTableStyle
}
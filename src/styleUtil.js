const marketPricesCardClassName = "card text-#{color} bg-#{mode} mb-3"
const marketPricesCardStyle = {width: "315px", marginLeft:"1.5rem", borderRadius: "20px"}
const marketPricesCardBodyClassName = "card-body"

exports.marketPricesCardStyle = (isDarkMode) => { 
    const mode = isDarkMode ? "dark" : "light"
    const color = isDarkMode ? "white" : "black"
    return {
        cardClassName : marketPricesCardClassName.replace("#{mode}", mode).replace("#{color}", color),
        cardStyle : marketPricesCardStyle,
        cardBodyClassName : marketPricesCardBodyClassName,
    }
}



const arbitrageCardClassName = "card text-#{color} bg-#{mode} mb-3"
const arbitrageCardStyle = (borderRadius) => {
    return {
        width: "350px", marginLeft:"1.5rem", borderRadius: borderRadius ? borderRadius : "20px"
    }
}
const arbitrageCardHeaderClassName = "card-header"
const arbitrageCardBodyClassName = "card-body"

exports.arbitrageCardStyle = (borderRadius, isDarkMode) => { 
    const mode = isDarkMode ? "dark" : "light"
    const color = isDarkMode ? "white" : "black"
    return {
        cardClassName : arbitrageCardClassName.replace("#{mode}", mode).replace("#{color}", color),
        cardStyle : arbitrageCardStyle(borderRadius),
        cardHeaderClassName : arbitrageCardHeaderClassName,
        cardBodyClassName : arbitrageCardBodyClassName,
        cardBodyStyle: {color: !isDarkMode ? "black" : null},
    }
}
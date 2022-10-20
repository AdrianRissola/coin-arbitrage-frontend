const marketPricesCardClassName = "card text-#{color} bg-#{mode} mb-3"
const marketPricesCardStyle = {width: "330px", marginLeft:"-1.5rem", borderRadius: "20px"}
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

const marketStatusCardStyle = {width: "500px", borderRadius: "20px"}

exports.marketStatusCardStyle = (isDarkMode) => { 
    const mode = isDarkMode ? "dark" : "light"
    const color = isDarkMode ? "white" : "black"
    return {
        cardClassName : marketPricesCardClassName.replace("#{mode}", mode).replace("#{color}", color),
        cardStyle : marketStatusCardStyle,
        cardBodyClassName : marketPricesCardBodyClassName,
    }
}



const arbitrageCardClassName = "card text-#{color} bg-#{mode} mb-3"
const arbitrageCardStyle = (borderRadius) => {
    return {
        width: "350px", marginRight:"1rem", padding: "0rem",
        borderRadius: borderRadius ? borderRadius : "20px",
        maxHeight:"350px"
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
        cardBodyStyle: {padding: "0rem", color: !isDarkMode ? "black" : null},
    }
}
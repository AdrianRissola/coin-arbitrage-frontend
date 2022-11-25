import axios from "axios";

const baseURL = "http://localhost:3001";
const markets = "/coin-arbitrage/crypto/markets";



const getMarkets = async () => {
    return await axios.get(baseURL.concat(markets)).then((response) => {
        console.log("MarketService.getMarkets:", response)
        return response;
    });
}

export { getMarkets }


import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();
const markets = "coin-arbitrage/crypto/markets";



const getMarkets = async () => {
    return await axios.get(baseURL.concat(markets)).then((response) => {
        console.log("MarketService.getMarkets:", response)
        return response;
    });
}

export { getMarkets }


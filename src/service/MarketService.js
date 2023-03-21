import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();
const markets = "coin-arbitrage/crypto/markets";
const availableTickers = 'coin-arbitrage/crypto/available-tickers';


const getMarkets = async () => {
    return await axios.get(baseURL.concat(markets)).then(
        (response) => {
        console.log("MarketService.getMarkets:", response)
        return response;
    }).catch(e => console.log(e));;
}

const getAllAvailableTickers = async () => {
    return await axios.get(baseURL.concat(availableTickers)).then(
        (response) => {
        console.log("MarketService.getAllAvailableTickers:", response)
        return response;
    }).catch(e => console.log(e));;
}

export { getMarkets, getAllAvailableTickers }


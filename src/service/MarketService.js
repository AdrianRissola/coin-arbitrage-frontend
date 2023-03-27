import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();
const markets = "coin-arbitrage/crypto/markets";
const availableTickers = 'coin-arbitrage/crypto/available-tickers';


const getMarkets = async () => {
    return await axios.get(baseURL.concat(markets)).then(
        (response) => {
        console.log("MarketService.getMarkets:", response.data)
        return response;
    }).catch(e => console.log(e));
}
getMarkets().then( response => {
    localStorage.setItem('marketsCheckboxDropdown', JSON.stringify(response.data.map(market => market.name).sort()));
})

const getAllAvailableTickers = async () => {
    return await axios.get(baseURL.concat(availableTickers)).then(
        (response) => {
        console.log("MarketService.getAllAvailableTickers:", response.data)
        return response;
    }).catch(e => console.log(e));
}
getAllAvailableTickers().then( response => {
    const availableWebsocketTickers = response.data.filter(ticker => ticker.websocket).map(ticker => ticker.name).sort()
    localStorage.setItem('availableWebsocketTickers', JSON.stringify(availableWebsocketTickers));
})

export { getMarkets, getAllAvailableTickers }


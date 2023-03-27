import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();

const historicalArbitrages = "coin-arbitrage/crypto/historical-arbitrages"


const getHistoricalArbitrages = async (ticker) => {
    return await axios.get(baseURL.concat(historicalArbitrages), {
        params: {
            ticker,
        }
      }).then(
        (response) => {
        console.log(`HistoricalArbitrageService.getHistoricalArbitrages(${ticker}):`, response.data)
        return response;
    }).catch(e => console.log(e));
}

getHistoricalArbitrages("BTC-USDT").then(
    response => {
        localStorage.setItem('historicalArbitrages', JSON.stringify(response.data));
    }
);


export { getHistoricalArbitrages }
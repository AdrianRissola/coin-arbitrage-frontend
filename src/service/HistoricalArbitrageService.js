import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();

const historicalArbitrages = "coin-arbitrage/crypto/historical-arbitrages"


const getHistoricalArbitrages = async (tickers) => {
    return await axios.get(baseURL.concat(historicalArbitrages), {
        params: {
            tickers,
        }  
    }).then(
        (response) => {
        console.log(`HistoricalArbitrageService.getHistoricalArbitrages(${tickers}):`, response.data)
        return response;
    }).catch(e => console.log("Axios Error in HistoricalArbitrageService.getHistoricalArbitrages:", e));
}

getHistoricalArbitrages(["BTC-USDT"]).then(
    response => {
        localStorage.setItem('historicalArbitrages', JSON.stringify(response.data));
    }
);


export { getHistoricalArbitrages }
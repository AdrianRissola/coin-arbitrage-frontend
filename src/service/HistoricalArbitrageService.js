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
        console.log("ArbitrageService.getHistoricalArbitrages:", response)
        return response;
    }).catch(e => console.log(e));
}

export { getHistoricalArbitrages }
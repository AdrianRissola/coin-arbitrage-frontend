import axios from "axios";
import { getRestApiEndpoint } from '../params';

const baseURL = getRestApiEndpoint();

const historicalArbitrages = "coin-arbitrage/crypto/historical-arbitrages"


const getHistoricalArbitrages = async () => {
    return await axios.get(baseURL.concat(historicalArbitrages)).then(
        (response) => {
        console.log("ArbitrageService.getHistoricalArbitrages:", response.data)
        return response;
    }).catch(e => console.log(e));;
}

export { getHistoricalArbitrages }
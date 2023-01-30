export const getWebsocketEndpoint = () => {
    let websocketEndpoint = process.env.REACT_APP_WEB_SOCKET_ENDPOINT
    if(!websocketEndpoint)
        websocketEndpoint = "wss://web-production-b204.up.railway.app/"
    console.log("websocketEndpoint: ", websocketEndpoint)
    return websocketEndpoint
}

export const getRestApiEndpoint = () => {
    let restApiEndpoint = process.env.REACT_APP_API_REST_ENDPOINT
    if(!restApiEndpoint)
        restApiEndpoint = "https://web-production-b204.up.railway.app/"
    console.log("restApiEndpoint: ", restApiEndpoint)
    return restApiEndpoint
}
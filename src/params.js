export const getWebsocketEndpoint = () => {
    let websocketEndpoint = process.env.REACT_APP_WEB_SOCKET_ENDPOINT
    if(!websocketEndpoint)
        websocketEndpoint = "wss://arcane-refuge-64485.herokuapp.com/"
    console.log("websocketEndpoint: ", websocketEndpoint)
    return websocketEndpoint
}

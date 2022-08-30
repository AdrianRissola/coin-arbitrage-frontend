export const getWebsocketEndpoint = () => {
    let websocketEndpoint = process.env.REACT_APP_PROD_WEB_SOCKET_ENDPOINT
    if(process.env.NODE_ENV!=="production")
        websocketEndpoint = process.env.REACT_APP_LOCAL_WEB_SOCKET_ENDPOINT
    else
        websocketEndpoint = "wss://arcane-refuge-64485.herokuapp.com/"
    console.log("websocketEndpoint: ", websocketEndpoint)
    return "wss://arcane-refuge-64485.herokuapp.com/"
}

import { marketStatusCardStyle } from "../styleUtil";

const greenHex = "#0ecb81"

const MarketsStatus = (props)=> {
    const marketsStatus = props.marketsStatus;
    const styles = marketStatusCardStyle(props.darkMode)

    return(
        <div className={styles.cardClassName} style={styles.cardStyle}>
            <div  style={{ textAlign: "center"}}>
                <b>
                    Websocket Market Connections <br/>
                    Connected: {marketsStatus.connectedMarkets.length} <br/>
                    Disconnected: {marketsStatus.disconnectedMarkets.length}
                </b>
            </div>
            <div className={styles.cardBodyClassName}>
                <table className="table">
                    <tbody>
                        {
                            marketsStatus.connectedMarkets.map(connectedMarket => {
                                return (
                                    <tr key={connectedMarket}>
                                        <td style={{ textAlign:"left", fontWeight: 'bold' }}>{ connectedMarket }</td>
                                        <td style={{ color:greenHex, textAlign:"right", fontWeight: 'bold' }} title={connectedMarket}>
                                            Connected
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        {
                            marketsStatus.disconnectedMarkets.map(disconnectedMarket => {
                                return (
                                    <tr key={disconnectedMarket}>
                                        <td style={{ color:"red", textAlign:"left", fontWeight: 'bold' }}>{ disconnectedMarket }</td>
                                        <td style={{ color:"red", textAlign:"right", fontWeight: 'bold' }} title={disconnectedMarket}>
                                            Disconnected
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>      
    )
}

export default MarketsStatus
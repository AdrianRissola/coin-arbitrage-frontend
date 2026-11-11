import { useState } from "react";
import { marketPricesCardStyle } from "../styleUtil";
import helper from "../helper";

const greenHex = "#0ecb81"
const mutedStyle = { fontSize: "75%", opacity: 0.65 };
const badgeStyle = { ...mutedStyle, color: "#f0b90b", marginLeft: "0.35rem" };

const formatPrice = value =>
    value === null || value === undefined || value === ""
        ? "—"
        : value.toLocaleString(navigator.language, { maximumSignificantDigits: 7 });

const MarketPrices = (props) => {
    const [order, setOrder] = useState(false);
    const ticker = props.ticker || 'coin-coin'
    const styles = marketPricesCardStyle(props.darkMode)
    const textColor = props.darkMode ? "white" : "black";
    const quoteCurrency = ticker.split('-')[1];

    const rows = (props.marketPrices ? [...props.marketPrices] : [])
        .map(marketPrice => ({
            ...marketPrice,
            group: marketPrice.connected === false ? 2 : marketPrice.stale ? 1 : 0,
        }))
        .sort((a, b) =>
            (a.group - b.group) ||
            (order
                ? (a.ask ?? a.price ?? Infinity) - (b.ask ?? b.price ?? Infinity)
                : 0));

    const statusBadge = row =>
        row.connected === false ? "disconnected" : row.stale ? "stale" : null;

    return (
        <div className={styles.cardClassName}
            style={{ ...styles.cardStyle, width: "400px", maxWidth: "100%" }}>
            <div className={styles.cardBodyClassName}>
                {props.marketPrices ?
                    <table className="table table-sm" style={{ color: textColor, width: "100%", tableLayout: "fixed", fontSize: "0.8rem" }}>
                        <colgroup>
                            <col style={{ width: "40%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "20%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th colSpan={3} className="text-center" style={{ fontSize: "18px", whiteSpace: "nowrap" }}>Prices ({quoteCurrency})</th>
                                <th>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"
                                            onClick={evt => { setOrder(evt.target.checked) }}
                                        />
                                        <label style={{ fontSize: "18px" }}>
                                            &#x2191;&#x2193;
                                        </label>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th style={{ whiteSpace: "nowrap" }}>{ticker.split('-')[0]} Markets ({props.marketPrices.length})</th>
                                <th style={{ whiteSpace: "nowrap" }}>Bid</th>
                                <th style={{ whiteSpace: "nowrap" }}>Ask</th>
                                <th style={{ whiteSpace: "nowrap" }}>Last</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(marketPrice => {
                                const badge = statusBadge(marketPrice);
                                const age = helper.ageLabel(marketPrice.timestamp);
                                return (
                                    <tr key={marketPrice.market}
                                        style={{ opacity: badge ? 0.55 : 1 }}
                                        title={age ? `${marketPrice.market} quote: ${age}` : marketPrice.market}>
                                        <td style={{ textAlign: "left", fontWeight: 'bold', whiteSpace: "nowrap" }}>
                                            {marketPrice.market}
                                            {badge ? <span style={badgeStyle}>{badge}</span> : null}
                                        </td>
                                        <td style={{ color: greenHex, textAlign: "right", fontWeight: 'bold', whiteSpace: "nowrap" }}
                                            title={marketPrice.bid}>
                                            {formatPrice(marketPrice.bid)}
                                        </td>
                                        <td style={{ color: "#f6465d", textAlign: "right", fontWeight: 'bold', whiteSpace: "nowrap" }}
                                            title={marketPrice.ask}>
                                            {formatPrice(marketPrice.ask)}
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 'bold', whiteSpace: "nowrap" }}
                                            title={marketPrice.price}>
                                            {formatPrice(marketPrice.price)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    : null}
            </div>
        </div>
    )
}

export default MarketPrices

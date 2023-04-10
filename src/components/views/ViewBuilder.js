import MarketStatusView from "../../components/views/MarketStatusView";
import HistoricalView from "../../components/views/HistoricalView";
import ArbitrageView from "./ArbitrageView";
import BestArbitrageView from "./BestArbitrageView";


const buildArbitrageView = (props) => {
    const arbitrageView = props.marketPrices ?
    <ArbitrageView
        ticker = { props.ticker }
        darkMode = { props.darkMode }
        handleChangeChannelSubscriptionClick = { props.handleChangeChannelSubscriptionClick }
        arbitrages = { props.arbitrages }
        marketPrices = { props.marketPrices[0] }
    /> : null;
    return arbitrageView;
}

const buildBestArbitrageView = (props) => <BestArbitrageView
        darkMode = { props.darkMode }
        bestArbitrage = { props.bestArbitrage }
        marketPrices = { props.marketPrices }
    />

const buildHistoricalView = (darkMode) => <HistoricalView darkMode = { darkMode } />

const buildMarketStatusView = (darkMode, marketStatus) => <MarketStatusView
    darkMode = { darkMode }
    marketStatus = { marketStatus }
/>




export { buildArbitrageView, buildBestArbitrageView, buildHistoricalView, buildMarketStatusView }
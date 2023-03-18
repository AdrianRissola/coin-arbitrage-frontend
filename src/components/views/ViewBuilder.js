import MarketStatusView from "../../components/views/MarketStatusView";
import HistoricalView from "../../components/views/HistoricalView";
import ArbitrageView from "./ArbitrageView";
import BestArbitrageView from "./BestArbitrageView";


const buildArbitrageView = (props) => <ArbitrageView
    ticker = { props.ticker }
    darkMode = { props.darkMode }
    availableTickers = { props.availableTickers }
    handleChangeChannelSubscriptionClick = { props.handleChangeChannelSubscriptionClick }
    arbitrages = { props.arbitrages }
    marketPrices = { props.marketPrices }
/>;

const buildBestArbitrageView = (props) => <BestArbitrageView
    darkMode = { props.darkMode }
    bestArbitrage = { props.bestArbitrage }
    marketPrices = { props.marketPrices }
    marketStatus = { props.marketStatus }
/>;

const buildHistoricalView = (darkMode) => <HistoricalView darkMode = { darkMode } />

const buildMarketStatusView = (darkMode, marketStatus) => <MarketStatusView
    darkMode = { darkMode }
    marketStatus = { marketStatus }
/>




export { buildArbitrageView, buildBestArbitrageView, buildHistoricalView, buildMarketStatusView }
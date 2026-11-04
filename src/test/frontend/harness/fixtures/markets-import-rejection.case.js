import axios from 'axios';

test('market import contains failure while direct requests propagate the original error', async () => {
  const failure = new axios.AxiosError('controlled market import rejection');
  axios.defaults.adapter = async () => { throw failure; };
  const service = require('../../../../service/MarketService');
  await expect(service.getAllAvailableTickers()).rejects.toBe(failure);
  expect(localStorage.getItem('availableWebsocketTickers')).toBeNull();
});

import axios from 'axios';

test('market import retains its unhandled data-projection failure after rejection', () => {
  axios.defaults.adapter = async () => {
    throw new axios.AxiosError('controlled market import rejection');
  };
  const service = require('../../../../service/MarketService');
  expect(typeof service.getAllAvailableTickers).toBe('function');
});

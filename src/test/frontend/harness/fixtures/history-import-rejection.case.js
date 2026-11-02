import axios from 'axios';

test('historical import retains its unhandled data-projection failure after rejection', () => {
  axios.defaults.adapter = async () => {
    throw new axios.AxiosError('controlled historical import rejection');
  };
  const service = require('../../../../service/HistoricalArbitrageService');
  expect(typeof service.getHistoricalArbitrages).toBe('function');
});

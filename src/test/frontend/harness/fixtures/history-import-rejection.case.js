import axios from 'axios';

test('historical import contains rejection while direct requests propagate it', async () => {
  const failure = new axios.AxiosError('controlled historical import rejection');
  axios.defaults.adapter = async () => {
    throw failure;
  };
  const service = require('../../../../service/HistoricalArbitrageService');
  await expect(service.getHistoricalArbitrages(null)).rejects.toBe(failure);
  expect(localStorage.getItem('historicalArbitrages')).toBeNull();
});

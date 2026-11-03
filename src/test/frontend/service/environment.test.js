import axios from 'axios';
import { getRuntime } from '../support/runtime';

test('CRA loads real Axios in its jsdom test environment', () => {
  expect(axios.VERSION).toBe(require('axios/package.json').version);
  expect(jest.isMockFunction(axios.get)).toBe(false);
  expect(typeof axios.getAdapter('xhr')).toBe('function');
  expect(typeof window.document.createElement).toBe('function');
});

test('offline endpoints and clean storage are installed before application imports', () => {
  expect(getRuntime().mode).toBe('offline');
  expect(process.env.REACT_APP_API_REST_ENDPOINT).toBe('http://127.0.0.1:1/');
  expect(process.env.REACT_APP_WEB_SOCKET_ENDPOINT).toBe('ws://127.0.0.1:1/');
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
});

// services/__tests__/api.integration.test.js
import api, { verifyToken } from '../api';
import AxiosMockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock global pour atob (décodage base64 du token)
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

describe('API Integration Test', () => {
  let mock;

  beforeEach(() => {
    // Créer un mock d'axios pour l'instance api
    mock = new AxiosMockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should perform GET request and receive data', async () => {
    mock.onGet('/test-get').reply(200, { message: 'ok' });

    const response = await api.get('/test-get');
    expect(response.data).toEqual({ message: 'ok' });
  });

  it('should perform POST request with data', async () => {
    const payload = { name: 'John' };
    mock.onPost('/create', payload).reply(201, { message: 'created' });

    const response = await api.post('/create', payload);
    expect(response.data).toEqual({ message: 'created' });
  });

  it('should add token from AsyncStorage to request headers', async () => {
    const fakeToken = 'abc.def.ghi';
    AsyncStorage.getItem.mockResolvedValue(fakeToken);

    mock.onGet('/auth-test').reply((config) => {
      expect(config.headers.Authorization).toBe(`Bearer ${fakeToken}`);
      return [200, { message: 'ok' }];
    });

    const response = await api.get('/auth-test');
    expect(response.data).toEqual({ message: 'ok' });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
  });

  it('should handle API errors', async () => {
    mock.onGet('/error').reply(500, { message: 'server error' });

    await expect(api.get('/error')).rejects.toThrow();
  });

  describe('verifyToken function', () => {
    it('returns false if no token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await verifyToken();
      expect(result).toBe(false);
    });

    it('returns false if token malformed', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid.token');
      const result = await verifyToken();
      expect(result).toBe(false);
    });

    it('returns false if token expired', async () => {
      const payload = { exp: Math.floor(Date.now() / 1000) - 1000 };
      const token = `aaa.${Buffer.from(JSON.stringify(payload)).toString('base64')}.ccc`;
      AsyncStorage.getItem.mockResolvedValue(token);

      const result = await verifyToken();
      expect(result).toBe(false);
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('returns true if token valid', async () => {
      const payload = { exp: Math.floor(Date.now() / 1000) + 1000 };
      const token = `aaa.${Buffer.from(JSON.stringify(payload)).toString('base64')}.ccc`;
      AsyncStorage.getItem.mockResolvedValue(token);

      const result = await verifyToken();
      expect(result).toBe(true);
    });
  });
});

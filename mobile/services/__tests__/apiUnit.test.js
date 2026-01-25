import api, { verifyToken } from '../api';
import AxiosMockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock d'AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock global pour atob (décodage base64 du token)
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

describe('API instance with AsyncStorage', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should have correct baseURL and headers', () => {
    expect(api.defaults.baseURL).toBe('http://192.168.11.180:8080/api');
    expect(api.defaults.timeout).toBe(10000);
    expect(api.defaults.headers['Accept']).toBe('application/json');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should add token from AsyncStorage to request headers', async () => {
    const fakeToken = 'abc.def.ghi';
    AsyncStorage.getItem.mockResolvedValue(fakeToken);

    mock.onGet('/test').reply((config) => {
      // Vérifier que le token est bien ajouté
      expect(config.headers.Authorization).toBe(`Bearer ${fakeToken}`);
      return [200, { message: 'ok' }];
    });

    const response = await api.get('/test');
    expect(response.data).toEqual({ message: 'ok' });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
  });

  it('should handle GET request', async () => {
    mock.onGet('/test-get').reply(200, { message: 'success' });
    const response = await api.get('/test-get');
    expect(response.data).toEqual({ message: 'success' });
  });

  it('should handle POST request with data', async () => {
    const data = { name: 'John' };
    mock.onPost('/create', data).reply(201, { message: 'created' });
    const response = await api.post('/create', data);
    expect(response.data).toEqual({ message: 'created' });
  });

  it('should handle error response', async () => {
    mock.onGet('/error').reply(403, { message: 'forbidden' });
    await expect(api.get('/error')).rejects.toThrow();
  });

  describe('verifyToken function', () => {
    it('should return false if no token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await verifyToken();
      expect(result).toBe(false);
    });

    it('should return false if token malformed', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid.token');
      const result = await verifyToken();
      expect(result).toBe(false);
    });

    it('should return false if token expired', async () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) - 1000,
        role: 'user',
      };
      const token = `aaa.${Buffer.from(JSON.stringify(payload)).toString('base64')}.ccc`;
      AsyncStorage.getItem.mockResolvedValue(token);

      const result = await verifyToken();
      expect(result).toBe(false);
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should return true if token valid', async () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 1000,
        role: 'admin',
      };
      const token = `aaa.${Buffer.from(JSON.stringify(payload)).toString('base64')}.ccc`;
      AsyncStorage.getItem.mockResolvedValue(token);

      const result = await verifyToken();
      expect(result).toBe(true);
    });
  });
});

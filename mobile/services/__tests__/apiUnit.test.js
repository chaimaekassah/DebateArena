import api from '../api';
import AxiosMockAdapter from 'axios-mock-adapter';

describe('API instance', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api); // on "attache" le mock à l'instance réelle
  });

  afterEach(() => {
    mock.restore();
  });

  it('should have correct baseURL and headers', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080/api');
    expect(api.defaults.timeout).toBe(10000);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should call GET /test-endpoint', async () => {
    mock.onGet('/test-endpoint').reply(200, { message: 'success' });

    const response = await api.get('/test-endpoint');
    expect(response.data).toEqual({ message: 'success' });
  });

  it('should call POST /create', async () => {
    const data = { name: 'John' };
    mock.onPost('/create', data).reply(201, { message: 'created' });

    const response = await api.post('/create', data);
    expect(response.data).toEqual({ message: 'created' });
  });

  it('should call PUT /update', async () => {
    const data = { name: 'Doe' };
    mock.onPut('/update', data).reply(200, { message: 'updated' });

    const response = await api.put('/update', data);
    expect(response.data).toEqual({ message: 'updated' });
  });

  it('should call DELETE /delete', async () => {
    mock.onDelete('/delete').reply(200, { message: 'deleted' });

    const response = await api.delete('/delete');
    expect(response.data).toEqual({ message: 'deleted' });
  });
});

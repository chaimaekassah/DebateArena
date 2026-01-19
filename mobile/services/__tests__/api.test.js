import api from '../api';
import { startTestServer } from '../TestServer';

describe('API – Integration Test', () => {
  let server;

  beforeAll(() => {
    server = startTestServer();
  });

  afterAll(() => {
    server.close();
  });

  it('GET /test-endpoint (real HTTP)', async () => {
    const response = await api.get('/test-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'success' });
  });

  it('POST /create (real HTTP)', async () => {
    const response = await api.post('/create', { name: 'John' });
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('created');
  });

  it('PUT /update (real HTTP)', async () => {
    const response = await api.put('/update', { name: 'Doe' });
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('updated');
  });

  it('DELETE /delete (real HTTP)', async () => {
    const response = await api.delete('/delete');
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('deleted');
  });
});

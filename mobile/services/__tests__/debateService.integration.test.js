// services/__tests__/debateService.fake.integration.test.js
import { DebateService } from '../debateService';
import api from '../api';
import AxiosMockAdapter from 'axios-mock-adapter';

describe('DebateService – Faux Integration Tests', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  const debatId = 123;

  it('getMessages – integration', async () => {
    const mockMessages = [{ id: 1, contenu: 'Hello' }];
    mock.onGet(`/debats/${debatId}/messages`).reply(200, mockMessages);

    const result = await DebateService.getMessages(debatId);
    expect(result).toEqual(mockMessages);
  });

  it('sendMessage – integration', async () => {
    const contenu = 'Nouveau message';
    const mockResp = { id: 1, contenu };
    mock
      .onPost(`/debats/${debatId}/messages`, { contenu })
      .reply(200, mockResp);

    const result = await DebateService.sendMessage(debatId, contenu);
    expect(result).toEqual(mockResp);
  });

  it('getDebate – integration', async () => {
    const mockDebate = { id: debatId, sujet: 'Test' };
    mock.onGet(`/debats/${debatId}`).reply(200, mockDebate);

    const result = await DebateService.getDebate(debatId);
    expect(result).toEqual(mockDebate);
  });

  it('finishDebate – integration', async () => {
    const mockResp = { status: 'finished' };
    mock.onPost(`/debats/${debatId}/terminer`).reply(200, mockResp);

    const result = await DebateService.finishDebate(debatId);
    expect(result).toEqual(mockResp);
  });

  it('evaluateDebate – integration', async () => {
    const mockResp = { score: 10 };
    mock.onPost(`/debats/${debatId}/evaluation`).reply(200, mockResp);

    const result = await DebateService.evaluateDebate(debatId);
    expect(result).toEqual(mockResp);
  });

  it('getMyDebates – integration', async () => {
    const mockDebates = [{ id: 1 }, { id: 2 }];
    mock.onGet('/debats/mes-debats').reply(200, mockDebates);

    const result = await DebateService.getMyDebates();
    expect(result).toEqual(mockDebates);
  });

  it('cancelDebate – integration', async () => {
    const mockResp = { status: 'cancelled' };
    mock.onDelete(`/debats/${debatId}`).reply(200, mockResp);

    const result = await DebateService.cancelDebate(debatId);
    expect(result).toEqual(mockResp);
  });
});

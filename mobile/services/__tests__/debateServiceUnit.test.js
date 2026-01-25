// services/__tests__/debateService.unit.test.js
import { DebateService } from '../debateService';
import api from '../api';

jest.mock('../api');

describe('DebateService – Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const debatId = 123;

  it('getMessages – récupère les messages', async () => {
    const mockMessages = [{ id: 1, contenu: 'Hello' }];
    api.get.mockResolvedValue({ data: mockMessages });

    const result = await DebateService.getMessages(debatId);

    expect(api.get).toHaveBeenCalledWith(`/debats/${debatId}/messages`);
    expect(result).toEqual(mockMessages);
  });

  it('sendMessage – envoie un message', async () => {
    const contenu = 'Nouveau message';
    const mockResponse = { id: 1, contenu };
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await DebateService.sendMessage(debatId, contenu);

    expect(api.post).toHaveBeenCalledWith(`/debats/${debatId}/messages`, {
      contenu,
    });
    expect(result).toEqual(mockResponse);
  });

  it('getDebate – récupère un débat', async () => {
    const mockDebate = { id: debatId, sujet: 'Test' };
    api.get.mockResolvedValue({ data: mockDebate });

    const result = await DebateService.getDebate(debatId);

    expect(api.get).toHaveBeenCalledWith(`/debats/${debatId}`);
    expect(result).toEqual(mockDebate);
  });

  it('finishDebate – termine un débat', async () => {
    const mockResp = { status: 'finished' };
    api.post.mockResolvedValue({ data: mockResp });

    const result = await DebateService.finishDebate(debatId);

    expect(api.post).toHaveBeenCalledWith(`/debats/${debatId}/terminer`);
    expect(result).toEqual(mockResp);
  });

  it('evaluateDebate – évalue un débat', async () => {
    const mockResp = { score: 10 };
    api.post.mockResolvedValue({ data: mockResp });

    const result = await DebateService.evaluateDebate(debatId);

    expect(api.post).toHaveBeenCalledWith(`/debats/${debatId}/evaluation`);
    expect(result).toEqual(mockResp);
  });

  it('getMyDebates – récupère mes débats', async () => {
    const mockDebates = [{ id: 1 }, { id: 2 }];
    api.get.mockResolvedValue({ data: mockDebates });

    const result = await DebateService.getMyDebates();

    expect(api.get).toHaveBeenCalledWith('/debats/mes-debats');
    expect(result).toEqual(mockDebates);
  });

  it('cancelDebate – annule un débat', async () => {
    const mockResp = { status: 'cancelled' };
    api.delete.mockResolvedValue({ data: mockResp });

    const result = await DebateService.cancelDebate(debatId);

    expect(api.delete).toHaveBeenCalledWith(`/debats/${debatId}`);
    expect(result).toEqual(mockResp);
  });
});

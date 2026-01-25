// services/__tests__/apiErrorHandler.unit.test.js
import { handleApiError, showErrorAlert } from '../apiErrorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

describe('apiErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network error (no response)', () => {
    const error = {};
    const result = handleApiError(error);
    expect(result).toEqual({
      userMessage: 'Erreur de connexion au serveur',
      shouldLogout: false,
    });
  });

  it('should handle 401 error and remove token', () => {
    const navigation = { navigate: jest.fn() };
    const error = { response: { status: 401 } };

    const result = handleApiError(error, navigation);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
    expect(result).toEqual({
      userMessage: 'Session expirée',
      shouldLogout: true,
    });
  });

  it('should handle 403 error', () => {
    const error = { response: { status: 403 } };
    const result = handleApiError(error);
    expect(result).toEqual({
      userMessage: 'Accès non autorisé à cette ressource',
      shouldLogout: false,
    });
  });

  it('should handle 404 error', () => {
    const error = { response: { status: 404 } };
    const result = handleApiError(error);
    expect(result).toEqual({
      userMessage: 'Ressource non trouvée',
      shouldLogout: false,
    });
  });

  it('should handle 500 error', () => {
    const error = { response: { status: 500 } };
    const result = handleApiError(error);
    expect(result).toEqual({
      userMessage: 'Erreur interne du serveur',
      shouldLogout: false,
    });
  });

  it('should handle default error with message', () => {
    const error = {
      response: { status: 418, data: { message: 'Je suis un teapot' } },
    };
    const result = handleApiError(error);
    expect(result).toEqual({
      userMessage: 'Erreur 418: Je suis un teapot',
      shouldLogout: false,
    });
  });

  it('showErrorAlert should call Alert.alert if shouldLogout=false', () => {
    const error = { response: { status: 403 } };
    showErrorAlert(error);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Erreur',
      'Accès non autorisé à cette ressource',
    );
  });

  it('showErrorAlert should NOT call Alert.alert if shouldLogout=true', () => {
    const navigation = { navigate: jest.fn() };
    const error = { response: { status: 401 } };
    showErrorAlert(error, navigation);
    expect(Alert.alert).not.toHaveBeenCalled(); // logout géré via setTimeout
  });
});

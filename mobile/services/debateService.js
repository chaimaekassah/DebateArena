// services/debateService.js
import api from './api';

export const DebateService = {
  async getMessages(debatId) {
    try {
      console.log(`📨 Récupération messages pour débat ${debatId}`);
      const response = await api.get(`/debats/${debatId}/messages`);
      console.log('✅ Messages récupérés:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération messages:', error);
      throw error;
    }
  },

  async sendMessage(debatId, contenu) {
    try {
      console.log(`📤 Envoi message à débat ${debatId}:`, contenu);
      const response = await api.post(`/debats/${debatId}/messages`, {
        contenu: contenu
      });
      console.log('✅ Message envoyé, réponse:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      throw error;
    }
  },

  async getDebate(debatId) {
    try {
      console.log(`🔍 Récupération débat ${debatId}`);
      const response = await api.get(`/debats/${debatId}`);
      console.log('✅ Débat récupéré:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération débat:', error);
      throw error;
    }
  },

  async finishDebate(debatId) {
    try {
      console.log(`🏁 Terminaison débat ${debatId}`);
      const response = await api.post(`/debats/${debatId}/terminer`);
      console.log('✅ Débat terminé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur terminaison débat:', error);
      throw error;
    }
  },

  async evaluateDebate(debatId) {
    try {
      console.log(`📝 Évaluation débat ${debatId}`);
      const response = await api.post(`/debats/${debatId}/evaluation`);
      console.log('✅ Évaluation reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur évaluation:', error);
      throw error;
    }
  },

  async getMyDebates() {
    try {
      console.log('📚 Récupération de mes débats');
      const response = await api.get('/debats/mes-debats');
      console.log('✅ Débats récupérés:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération débats:', error);
      throw error;
    }
  },

  async cancelDebate(debatId) {
    try {
      console.log(`❌ Annulation débat ${debatId}`);
      const response = await api.delete(`/debats/${debatId}`);
      console.log('✅ Débat annulé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur annulation débat:', error);
      throw error;
    }
  }
};
import api from "./api";

export const sendMessageToAI = async (message) => {
  // MOCK TEMPORAIRE
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          reply: "🤖 Réponse simulée de l’IA (Axios)",
        },
      });
    }, 1200);
  });

  // PLUS TARD (backend réel)
  // return api.post("/chat", { message });
};

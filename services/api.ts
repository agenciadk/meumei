
// Simulação de API Service
export const api = {
  deleteIncome: async (id: string) => {
    console.log('Chamando API DELETE para income id:', id);
    // Simula delay de rede e sucesso da operação (Status 200)
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
};

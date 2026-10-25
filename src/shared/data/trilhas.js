// Catálogo de trilhas mapeadas em Minas Gerais. Coordenadas aproximadas.
// "regiao" agrupa os locais pela previsão de chuva da Defesa Civil.
export const TRILHAS = [
  { id: 'cipo-grande', nome: 'Cachoeira Grande – Serra do Cipó', cidade: 'Santana do Riacho', uf: 'MG', regiao: 'Serra do Espinhaço', lat: -19.29, lng: -43.59, tipo: 'Cachoeira' },
  { id: 'farofa', nome: 'Cachoeira da Farofa', cidade: 'Santana do Riacho', uf: 'MG', regiao: 'Serra do Espinhaço', lat: -19.38, lng: -43.56, tipo: 'Cachoeira' },
  { id: 'lapinha', nome: 'Lapinha da Serra', cidade: 'Santana do Riacho', uf: 'MG', regiao: 'Serra do Espinhaço', lat: -19.12, lng: -43.68, tipo: 'Rio / poços' },
  { id: 'tabuleiro', nome: 'Cachoeira do Tabuleiro', cidade: 'Conceição do Mato Dentro', uf: 'MG', regiao: 'Serra do Espinhaço', lat: -19.05, lng: -43.56, tipo: 'Cachoeira' },
  { id: 'milho-verde', nome: 'Cachoeira do Moinho – Milho Verde', cidade: 'Serro', uf: 'MG', regiao: 'Alto Jequitinhonha', lat: -18.47, lng: -43.46, tipo: 'Cachoeira' },
  { id: 'capitolio', nome: 'Cânions de Furnas', cidade: 'Capitólio', uf: 'MG', regiao: 'Oeste / Canastra', lat: -20.65, lng: -46.31, tipo: 'Cânion' },
  { id: 'casca-danta', nome: "Cachoeira Casca d'Anta", cidade: 'São Roque de Minas', uf: 'MG', regiao: 'Oeste / Canastra', lat: -20.3, lng: -46.52, tipo: 'Cachoeira' },
  { id: 'ibitipoca', nome: 'Parque Estadual do Ibitipoca', cidade: 'Lima Duarte', uf: 'MG', regiao: 'Zona da Mata', lat: -21.7, lng: -43.89, tipo: 'Rio / poços' },
  { id: 'carrancas', nome: 'Complexo da Zilda', cidade: 'Carrancas', uf: 'MG', regiao: 'Sul de Minas', lat: -21.49, lng: -44.64, tipo: 'Cachoeira' },
  { id: 'sao-thome', nome: 'Cachoeira da Eubiose', cidade: 'São Thomé das Letras', uf: 'MG', regiao: 'Sul de Minas', lat: -21.72, lng: -44.98, tipo: 'Cachoeira' },
  { id: 'macacos', nome: 'Cachoeiras de Macacos', cidade: 'Nova Lima', uf: 'MG', regiao: 'Região Metropolitana de BH', lat: -20.08, lng: -43.85, tipo: 'Cachoeira' },
  { id: 'brumadinho', nome: 'Cachoeira da Ostra', cidade: 'Brumadinho', uf: 'MG', regiao: 'Região Metropolitana de BH', lat: -20.14, lng: -44.2, tipo: 'Cachoeira' },
];

export function buscarTrilha(id) {
  return TRILHAS.find((trilha) => trilha.id === id);
}

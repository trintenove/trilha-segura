// Catálogo de trilhas mapeadas. Coordenadas aproximadas.
export const TRILHAS = [
  { id: 'tabuleiro', nome: 'Cachoeira do Tabuleiro', cidade: 'Conceição do Mato Dentro', uf: 'MG', lat: -19.06, lng: -43.56, tipo: 'Cachoeira' },
  { id: 'cipo-grande', nome: 'Cachoeira Grande – Serra do Cipó', cidade: 'Santana do Riacho', uf: 'MG', lat: -19.29, lng: -43.59, tipo: 'Cachoeira' },
  { id: 'capitolio', nome: 'Cânions de Furnas', cidade: 'Capitólio', uf: 'MG', lat: -20.65, lng: -46.31, tipo: 'Cânion' },
  { id: 'santa-barbara', nome: 'Cachoeira Santa Bárbara', cidade: 'Cavalcante', uf: 'GO', lat: -13.73, lng: -47.47, tipo: 'Cachoeira' },
  { id: 'vale-da-lua', nome: 'Vale da Lua', cidade: 'Alto Paraíso de Goiás', uf: 'GO', lat: -14.17, lng: -47.79, tipo: 'Rio / poços' },
  { id: 'buracao', nome: 'Cachoeira do Buracão', cidade: 'Ibicoara', uf: 'BA', lat: -13.36, lng: -41.27, tipo: 'Cânion' },
  { id: 'fumaca', nome: 'Cachoeira da Fumaça', cidade: 'Palmeiras (Vale do Capão)', uf: 'BA', lat: -12.6, lng: -41.53, tipo: 'Cachoeira' },
  { id: 'toboga', nome: 'Cachoeira do Tobogã', cidade: 'Paraty', uf: 'RJ', lat: -23.2, lng: -44.76, tipo: 'Cachoeira' },
  { id: 'veu-itatiaia', nome: 'Véu da Noiva – Itatiaia', cidade: 'Itatiaia', uf: 'RJ', lat: -22.43, lng: -44.62, tipo: 'Cachoeira' },
  { id: 'toca-ilhabela', nome: 'Cachoeira da Toca', cidade: 'Ilhabela', uf: 'SP', lat: -23.8, lng: -45.38, tipo: 'Cachoeira' },
  { id: 'saltao-brotas', nome: 'Cachoeira do Saltão', cidade: 'Brotas', uf: 'SP', lat: -22.28, lng: -48.13, tipo: 'Cachoeira' },
  { id: 'itaimbezinho', nome: 'Cânion Itaimbezinho', cidade: 'Cambará do Sul', uf: 'RS', lat: -29.16, lng: -50.08, tipo: 'Cânion' },
];

export function buscarTrilha(id) {
  return TRILHAS.find((trilha) => trilha.id === id);
}

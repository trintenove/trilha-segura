// Denúncias de cabeça d'água feitas por quem está no local.
// Chegam na hora ao painel dos bombeiros e ficam "abertas" até serem atendidas.

import { criarArmazenamento, useRegistros } from './armazenamento/index.js';

export const SINAIS = [
  { id: 'subiu', rotulo: 'A água subiu de repente' },
  { id: 'barrenta', rotulo: 'Água barrenta ou turva' },
  { id: 'galhos', rotulo: 'Galhos, troncos ou espuma descendo' },
  { id: 'barulho', rotulo: 'Barulho forte da correnteza' },
  { id: 'chuva', rotulo: 'Chuva forte rio acima' },
];

const armazenamento = criarArmazenamento('denuncias', {
  trilhaId: 'trilha_id',
  lat: 'lat',
  lng: 'lng',
  sinais: 'sinais',
  pessoasEmPerigo: 'pessoas_em_perigo',
  observacao: 'observacao',
  autor: 'autor',
  status: 'status',
});

export function enviarDenuncia({ trilhaId, lat, lng, sinais, pessoasEmPerigo, observacao, autor }) {
  return armazenamento.inserir({ trilhaId, lat, lng, sinais, pessoasEmPerigo, observacao, autor, status: 'aberta' });
}

export const marcarAtendida = (id) => armazenamento.atualizar(id, { status: 'atendida' });

export function useDenuncias() {
  const { registros, carregando, erro } = useRegistros(armazenamento);
  return { denuncias: registros, carregando, erro };
}

export const denunciasAbertas = (denuncias) => denuncias.filter((d) => d.status === 'aberta');

export const rotuloSinal = (id) => SINAIS.find((s) => s.id === id)?.rotulo ?? id;

// Trilha mapeada mais próxima de uma coordenada (distância em km).
export function trilhaMaisProxima(trilhas, lat, lng) {
  const radianos = (graus) => (graus * Math.PI) / 180;
  const distancia = (t) => {
    const a =
      Math.sin(radianos(t.lat - lat) / 2) ** 2 + Math.cos(radianos(lat)) * Math.cos(radianos(t.lat)) * Math.sin(radianos(t.lng - lng) / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
  };
  return trilhas.map((trilha) => ({ trilha, km: distancia(trilha) })).sort((a, b) => a.km - b.km)[0] ?? null;
}

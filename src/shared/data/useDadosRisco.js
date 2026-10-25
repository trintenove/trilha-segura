import { useEffect, useState } from 'react';
import { TRILHAS } from './trilhas.js';
import { buscarOcorrenciasBombeiros, buscarPrevisaoDefesaCivil } from './fontes.js';
import { calcularRisco } from '../risco.js';

// Junta as duas fontes e calcula o risco de cada trilha para cada dia da previsão.
export async function carregarDadosRisco() {
  const [ocorrencias, previsoes] = await Promise.all([buscarOcorrenciasBombeiros(), buscarPrevisaoDefesaCivil()]);

  return TRILHAS.map((trilha) => {
    const { ocorrencias: total } = ocorrencias.find((o) => o.trilhaId === trilha.id);
    const { previsao } = previsoes.find((p) => p.trilhaId === trilha.id);
    const dias = previsao.map((dia) => ({ ...dia, risco: calcularRisco({ ocorrencias: total, probChuva: dia.probChuva }) }));
    return { ...trilha, ocorrencias: total, previsao: dias, hoje: dias[0] };
  });
}

export function diaDaPrevisao(trilha, data) {
  return trilha.previsao.find((dia) => dia.data === data) ?? null;
}

export function useDadosRisco() {
  const [estado, setEstado] = useState({ carregando: true, trilhas: [], atualizadoEm: null, erro: null });

  useEffect(() => {
    let ativo = true;
    carregarDadosRisco()
      .then((trilhas) => ativo && setEstado({ carregando: false, trilhas, atualizadoEm: new Date(), erro: null }))
      .catch((erro) => ativo && setEstado((atual) => ({ ...atual, carregando: false, erro })));
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}

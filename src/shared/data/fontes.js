// Fontes de dados externas.
//
// ATENÇÃO: por enquanto os números são SIMULADOS para demonstração.
// Para usar dados reais, troque o corpo destas duas funções por chamadas às
// APIs/planilhas do Corpo de Bombeiros e da Defesa Civil, mantendo o mesmo
// formato de retorno. O resto do app não precisa mudar.

import { TRILHAS } from './trilhas.js';
import { hojeISO, somarDias } from '../datas.js';

export const DIAS_DE_PREVISAO = 7;

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Ocorrências de cabeça d'água / afogamento registradas pelos bombeiros
// em cada localidade nos últimos 5 anos (simulado).
const OCORRENCIAS_BOMBEIROS = {
  tabuleiro: 11,
  'cipo-grande': 14,
  capitolio: 8,
  'santa-barbara': 6,
  'vale-da-lua': 15,
  buracao: 12,
  fumaca: 5,
  toboga: 9,
  'veu-itatiaia': 7,
  'toca-ilhabela': 4,
  'saltao-brotas': 10,
  itaimbezinho: 3,
};

// Tendência de chuva da região nesta época do ano (simulado).
const CHUVA_BASE_REGIAO = { MG: 72, GO: 78, BA: 55, RJ: 68, SP: 64, RS: 45 };

// Cenário fixo para a apresentação: garante que sempre exista ao menos um
// local com risco crítico (> 80%) para demonstrar o alerta aos bombeiros.
const CHUVA_MINIMA_DEMO = { 'vale-da-lua': 86 };

export async function buscarOcorrenciasBombeiros() {
  await esperar(250);
  return TRILHAS.map((trilha) => ({
    trilhaId: trilha.id,
    ocorrencias: OCORRENCIAS_BOMBEIROS[trilha.id] ?? 0,
    periodo: 'últimos 5 anos',
  }));
}

export async function buscarPrevisaoDefesaCivil(dias = DIAS_DE_PREVISAO) {
  await esperar(350);
  const hoje = hojeISO();
  return TRILHAS.map((trilha) => ({
    trilhaId: trilha.id,
    previsao: Array.from({ length: dias }, (_, i) => {
      const data = somarDias(hoje, i);
      const sorteio = aleatorioComSemente(`${trilha.id}|${data}`);
      const sorteada = CHUVA_BASE_REGIAO[trilha.uf] + (sorteio() - 0.4) * 50;
      const probChuva = Math.round(Math.min(98, Math.max(5, CHUVA_MINIMA_DEMO[trilha.id] ?? 0, sorteada)));
      const milimetros = Math.round((probChuva / 100) ** 2 * 60 * sorteio());
      return { data, probChuva, milimetros };
    }),
  }));
}

// Gerador pseudoaleatório determinístico: a mesma trilha no mesmo dia
// sempre recebe a mesma previsão, e os valores mudam a cada dia.
export function aleatorioComSemente(texto) {
  let semente = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    semente = Math.imul(semente ^ texto.charCodeAt(i), 16777619);
  }
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

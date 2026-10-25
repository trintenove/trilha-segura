// Cálculo da porcentagem de risco de cabeça d'água.
//
// Cruza duas fontes:
//  - Corpo de Bombeiros: quantas ocorrências já aconteceram no local
//    (mostra o quanto aquele ponto é propenso ao fenômeno);
//  - Defesa Civil: probabilidade de chuva na região no dia da visita
//    (a chuva é o gatilho da cabeça d'água).
//
// risco = 15% × histórico + 85% × chuva × (0,3 + 0,7 × histórico)
//
// Assim, um local com muitas ocorrências nunca fica com risco zero, mas o
// risco só passa de 80% quando há chuva forte prevista E histórico alto.

export const LIMIAR_ALERTA_BOMBEIROS = 80;

// Nº de ocorrências a partir do qual o histórico é considerado máximo.
export const OCORRENCIAS_REFERENCIA = 15;

export const NIVEIS = {
  baixo: { id: 'baixo', rotulo: 'Baixo', cor: '#2E9E5B', dica: 'Condições favoráveis. Mantenha a atenção.' },
  moderado: { id: 'moderado', rotulo: 'Moderado', cor: '#D9A10B', dica: 'Fique atento ao céu e ao nível da água.' },
  alto: { id: 'alto', rotulo: 'Alto', cor: '#EE6C17', dica: 'Evite banhos e travessias de rio.' },
  critico: { id: 'critico', rotulo: 'Crítico', cor: '#D7192D', dica: 'Visita não recomendada. Risco de cabeça d\'água.' },
};

const limitar = (valor) => Math.min(1, Math.max(0, valor));

export function indiceHistorico(ocorrencias) {
  return limitar(ocorrencias / OCORRENCIAS_REFERENCIA);
}

export function calcularRisco({ ocorrencias, probChuva }) {
  const historico = indiceHistorico(ocorrencias);
  const chuva = limitar(probChuva / 100);
  return Math.round(100 * (0.15 * historico + 0.85 * chuva * (0.3 + 0.7 * historico)));
}

export function nivelDoRisco(risco) {
  if (risco > LIMIAR_ALERTA_BOMBEIROS) return NIVEIS.critico;
  if (risco >= 60) return NIVEIS.alto;
  if (risco >= 30) return NIVEIS.moderado;
  return NIVEIS.baixo;
}

// Acima de 80%, quem confirmar a viagem é sinalizado aos bombeiros.
export function exigeAlertaBombeiros(risco) {
  return risco > LIMIAR_ALERTA_BOMBEIROS;
}

export function rotuloHistorico(ocorrencias) {
  const indice = indiceHistorico(ocorrencias);
  if (indice >= 0.66) return 'alto';
  if (indice >= 0.33) return 'médio';
  return 'baixo';
}

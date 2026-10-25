// Agrupa as viagens cadastradas por localidade para o painel dos bombeiros.

import { diaDaPrevisao } from './data/useDadosRisco.js';
import { nivelDoRisco } from './risco.js';
import { resumirPessoas } from './viagens.js';

export function agregarPorLocalidade(trilhas, viagens, { de, ate }) {
  const localidades = [];

  for (const trilha of trilhas) {
    const doLocal = viagens.filter((v) => v.trilhaId === trilha.id && v.data >= de && v.data <= ate);
    if (doLocal.length === 0) continue;

    // O risco da localidade é o pior risco entre os dias com visitantes no período.
    const viagensComRisco = doLocal.map((v) => ({ ...v, risco: diaDaPrevisao(trilha, v.data)?.risco ?? v.riscoNoCadastro }));
    const risco = Math.max(...viagensComRisco.map((v) => v.risco));
    const pessoas = resumirPessoas(doLocal.flatMap((v) => v.pessoas));

    localidades.push({
      trilha,
      risco,
      nivel: nivelDoRisco(risco),
      ...pessoas,
      viagens: viagensComRisco.sort((a, b) => a.data.localeCompare(b.data) || b.risco - a.risco),
      sinalizadas: doLocal.filter((v) => v.sinalizadaBombeiros).length,
      // Assumiram o risco, mas ainda não informaram quem está no grupo.
      gruposNaoInformados: doLocal.filter((v) => v.status === 'alerta').length,
    });
  }

  return localidades.sort(compararPrioridade);
}

// Maior risco primeiro; empate → mais pessoas vulneráveis → mais pessoas.
export function compararPrioridade(a, b) {
  return b.risco - a.risco || b.vulneraveis - a.vulneraveis || b.total - a.total;
}

export function totalizar(localidades) {
  const soma = (campo, lista = localidades) => lista.reduce((total, l) => total + l[campo], 0);
  const criticas = localidades.filter((l) => l.nivel.id === 'critico');
  return {
    localidades: localidades.length,
    pessoas: soma('total'),
    pessoasEmAreaCritica: soma('total', criticas),
    localidadesCriticas: criticas.length,
    criancas: soma('criancas'),
    idosos: soma('idosos'),
    naoNadam: soma('naoNadam'),
    vulneraveis: soma('vulneraveis'),
    sinalizadas: soma('sinalizadas'),
    gruposNaoInformados: soma('gruposNaoInformados'),
  };
}

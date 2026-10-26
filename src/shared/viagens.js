// Viagens ("reservas") cadastradas no app do turista e lidas pelo app dos bombeiros.
//
// Status de uma viagem:
//  - 'alerta'     → o turista confirmou um local com risco > 80% e assumiu o
//                   risco. Os bombeiros são avisados NA HORA, mesmo antes de
//                   ele preencher os dados do grupo;
//  - 'confirmada' → a reserva foi concluída com os dados do grupo.

import { criarArmazenamento, useRegistros } from './armazenamento/index.js';
import { gravarLocal, lerLocal } from './armazenamento/local.js';
import { calcularRisco, exigeAlertaBombeiros } from './risco.js';
import { aleatorioComSemente } from './data/fontes.js';
import { hojeISO } from './datas.js';

const armazenamento = criarArmazenamento('viagens', {
  trilhaId: 'trilha_id',
  data: 'data',
  status: 'status',
  riscoNoCadastro: 'risco_no_cadastro',
  sinalizadaBombeiros: 'sinalizada_bombeiros',
  aceitouRisco: 'aceitou_risco',
  responsavel: 'responsavel',
  pessoas: 'pessoas',
  demo: 'demo',
});

// Faixa etária de cada pessoa do grupo, escolhida com um toque.
export const FAIXAS = [
  { id: 'adulto', rotulo: 'Adulto' },
  { id: 'crianca', rotulo: 'Criança' }, // até 11 anos (ECA)
  { id: 'idoso', rotulo: 'Idoso' }, // 60 anos ou mais (Estatuto da Pessoa Idosa)
];

const vulneravel = (p) => p.faixa !== 'adulto' || !p.sabeNadar;

export function resumirPessoas(pessoas) {
  return {
    total: pessoas.length,
    criancas: pessoas.filter((p) => p.faixa === 'crianca').length,
    idosos: pessoas.filter((p) => p.faixa === 'idoso').length,
    naoNadam: pessoas.filter((p) => !p.sabeNadar).length,
    vulneraveis: pessoas.filter(vulneravel).length,
  };
}

// ---- Ações do turista ------------------------------------------------------

const CHAVE_MINHAS = 'trilhasegura:minhas-viagens';

export const idsDasMinhasViagens = () => lerLocal(CHAVE_MINHAS, []);

// Chamado assim que o turista assume um risco acima de 80%.
export async function registrarPotencialVitima({ trilhaId, data, risco, responsavel }) {
  const viagem = await armazenamento.inserir({
    trilhaId,
    data,
    status: 'alerta',
    riscoNoCadastro: risco,
    sinalizadaBombeiros: true,
    aceitouRisco: true,
    responsavel,
    pessoas: [],
  });
  gravarLocal(CHAVE_MINHAS, [...idsDasMinhasViagens(), viagem.id]);
  return viagem;
}

export async function concluirReserva({ viagemId, trilhaId, data, risco, responsavel, pessoas }) {
  if (viagemId) {
    await armazenamento.atualizar(viagemId, { status: 'confirmada', responsavel, pessoas });
    return viagemId;
  }
  const viagem = await armazenamento.inserir({
    trilhaId,
    data,
    status: 'confirmada',
    riscoNoCadastro: risco,
    sinalizadaBombeiros: exigeAlertaBombeiros(risco),
    aceitouRisco: false,
    responsavel,
    pessoas,
  });
  gravarLocal(CHAVE_MINHAS, [...idsDasMinhasViagens(), viagem.id]);
  return viagem.id;
}

export async function cancelarViagem(id) {
  await armazenamento.excluir(id);
  gravarLocal(CHAVE_MINHAS, idsDasMinhasViagens().filter((meuId) => meuId !== id));
}

// ---- Leitura ao vivo -------------------------------------------------------

export function useViagens() {
  const { registros, carregando, erro } = useRegistros(armazenamento);
  return { viagens: registros, carregando, erro };
}

// ---- Dados de exemplo para a apresentação ----------------------------------

const NOMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabi', 'Heitor', 'Isis', 'João', 'Karen', 'Lucas', 'Marina', 'Nina', 'Otávio', 'Paula'];

export function criarViagensExemplo(trilhas, semente = hojeISO()) {
  const sorteio = aleatorioComSemente(`exemplo|${semente}`);
  const inteiro = (min, max) => min + Math.floor(sorteio() * (max - min + 1));

  return Array.from({ length: 34 }, (_, i) => {
    const trilha = trilhas[inteiro(0, trilhas.length - 1)];
    const dia = trilha.previsao[inteiro(0, Math.min(4, trilha.previsao.length - 1))];
    const pessoas = Array.from({ length: inteiro(1, 6) }, () => {
      const sorteada = sorteio();
      const faixa = sorteada < 0.2 ? 'crianca' : sorteada < 0.85 ? 'adulto' : 'idoso';
      return { faixa, sabeNadar: sorteio() > (faixa === 'crianca' ? 0.5 : 0.18) };
    });
    const risco = calcularRisco({ ocorrencias: trilha.ocorrencias, probChuva: dia.probChuva });
    return {
      trilhaId: trilha.id,
      data: dia.data,
      status: 'confirmada',
      riscoNoCadastro: risco,
      sinalizadaBombeiros: exigeAlertaBombeiros(risco),
      aceitouRisco: exigeAlertaBombeiros(risco),
      responsavel: { nome: `${NOMES[i % NOMES.length]} (exemplo)`, telefone: '' },
      pessoas,
      demo: true,
    };
  });
}

export async function carregarExemplos(trilhas) {
  await armazenamento.excluirExemplos();
  await armazenamento.inserirVarias(criarViagensExemplo(trilhas));
}

export const removerExemplos = () => armazenamento.excluirExemplos();

// Viagens ("reservas") cadastradas no app do turista e lidas pelo app dos bombeiros.
//
// Status de uma viagem:
//  - 'alerta'     → o turista confirmou um local com risco > 80% e assumiu o
//                   risco. Os bombeiros são avisados NA HORA, mesmo antes de
//                   ele preencher os dados do grupo;
//  - 'confirmada' → a reserva foi concluída com os dados do grupo.

import { useEffect, useRef, useState } from 'react';
import { armazenamentoLocal, gravarLocal, lerLocal } from './armazenamento/local.js';
import { criarArmazenamentoSupabase } from './armazenamento/supabase.js';
import { calcularRisco, exigeAlertaBombeiros } from './risco.js';
import { aleatorioComSemente } from './data/fontes.js';
import { hojeISO } from './datas.js';

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL;
const CHAVE_SUPABASE = import.meta.env.VITE_SUPABASE_KEY;

// Com as variáveis do Supabase configuradas, os dados ficam online;
// sem elas, ficam só neste navegador.
export const armazenamento =
  URL_SUPABASE && CHAVE_SUPABASE ? criarArmazenamentoSupabase(URL_SUPABASE, CHAVE_SUPABASE) : armazenamentoLocal;

export const IDADE_CRIANCA = 12; // menores de 12 anos (ECA)
export const IDADE_IDOSO = 60; // 60 anos ou mais (Estatuto da Pessoa Idosa)

export function resumirPessoas(pessoas) {
  return {
    total: pessoas.length,
    criancas: pessoas.filter((p) => p.idade < IDADE_CRIANCA).length,
    idosos: pessoas.filter((p) => p.idade >= IDADE_IDOSO).length,
    naoNadam: pessoas.filter((p) => !p.sabeNadar).length,
    vulneraveis: pessoas.filter((p) => p.idade < IDADE_CRIANCA || p.idade >= IDADE_IDOSO || !p.sabeNadar).length,
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
  const [estado, setEstado] = useState({ viagens: [], carregando: true, erro: null });
  const pedido = useRef(0);

  useEffect(() => {
    const recarregar = () => {
      const meuPedido = ++pedido.current;
      armazenamento
        .listar()
        .then((viagens) => meuPedido === pedido.current && setEstado({ viagens, carregando: false, erro: null }))
        .catch((erro) => meuPedido === pedido.current && setEstado((atual) => ({ ...atual, carregando: false, erro })));
    };
    recarregar();
    const cancelar = armazenamento.assinar(recarregar);
    return () => {
      pedido.current++;
      cancelar();
    };
  }, []);

  return estado;
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
      const faixa = sorteio();
      const idade = faixa < 0.2 ? inteiro(2, 11) : faixa < 0.85 ? inteiro(14, 59) : inteiro(60, 78);
      return { idade, sabeNadar: sorteio() > (idade < IDADE_CRIANCA ? 0.5 : 0.18) };
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

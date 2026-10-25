// Armazenamento online (Supabase): permite que o alerta saia do celular do
// turista e chegue, ao vivo, no celular do bombeiro.
// A tabela é criada pelo script supabase/setup.sql.

import { createClient } from '@supabase/supabase-js';

// O banco usa nomes em snake_case; o app usa camelCase.
const COLUNAS = {
  trilhaId: 'trilha_id',
  data: 'data',
  status: 'status',
  riscoNoCadastro: 'risco_no_cadastro',
  sinalizadaBombeiros: 'sinalizada_bombeiros',
  aceitouRisco: 'aceitou_risco',
  responsavel: 'responsavel',
  pessoas: 'pessoas',
  demo: 'demo',
};

// Converte só os campos informados (serve para inserir e para atualizar).
const paraBanco = (campos) =>
  Object.fromEntries(Object.entries(campos).filter(([chave]) => chave in COLUNAS).map(([chave, valor]) => [COLUNAS[chave], valor]));

const doBanco = (linha) => ({
  id: linha.id,
  trilhaId: linha.trilha_id,
  data: linha.data,
  status: linha.status,
  riscoNoCadastro: linha.risco_no_cadastro,
  sinalizadaBombeiros: linha.sinalizada_bombeiros,
  aceitouRisco: linha.aceitou_risco,
  responsavel: linha.responsavel,
  pessoas: linha.pessoas,
  demo: linha.demo,
  criadaEm: linha.criada_em,
});

function verificar({ data, error }) {
  if (error) throw error;
  return data;
}

export function criarArmazenamentoSupabase(url, chave) {
  const cliente = createClient(url, chave);
  const tabela = () => cliente.from('viagens');

  return {
    modo: 'online',

    async listar() {
      return verificar(await tabela().select('*').order('criada_em')).map(doBanco);
    },

    async inserir(campos) {
      return doBanco(verificar(await tabela().insert(paraBanco(campos)).select().single()));
    },

    async inserirVarias(lista) {
      verificar(await tabela().insert(lista.map(paraBanco)));
    },

    async atualizar(id, campos) {
      verificar(await tabela().update(paraBanco(campos)).eq('id', id));
    },

    async excluir(id) {
      verificar(await tabela().delete().eq('id', id));
    },

    async excluirExemplos() {
      verificar(await tabela().delete().eq('demo', true));
    },

    assinar(aoMudar) {
      const canal = cliente
        .channel(`viagens-${Math.random().toString(16).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'viagens' }, aoMudar)
        .subscribe();
      return () => cliente.removeChannel(canal);
    },
  };
}

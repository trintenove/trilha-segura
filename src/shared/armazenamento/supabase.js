// Armazenamento online (Supabase): permite que alertas e denúncias saiam do
// celular do turista e cheguem, ao vivo, no celular do bombeiro.
// As tabelas são criadas pelo script supabase/setup.sql.

function verificar({ data, error }) {
  if (error) throw error;
  return data;
}

// colunas: { nomeNoApp: 'nome_no_banco' }. O banco usa snake_case; o app, camelCase.
export function criarArmazenamentoSupabase(cliente, tabela, colunas) {
  // Converte só os campos informados (serve para inserir e para atualizar).
  const paraBanco = (campos) =>
    Object.fromEntries(Object.entries(campos).filter(([chave]) => chave in colunas).map(([chave, valor]) => [colunas[chave], valor]));

  const doBanco = (linha) => ({
    id: linha.id,
    criadaEm: linha.criada_em,
    ...Object.fromEntries(Object.entries(colunas).map(([chave, coluna]) => [chave, linha[coluna]])),
  });

  const consulta = () => cliente.from(tabela);

  return {
    async listar() {
      return verificar(await consulta().select('*').order('criada_em')).map(doBanco);
    },

    async inserir(campos) {
      return doBanco(verificar(await consulta().insert(paraBanco(campos)).select().single()));
    },

    async inserirVarias(lista) {
      verificar(await consulta().insert(lista.map(paraBanco)));
    },

    async atualizar(id, campos) {
      verificar(await consulta().update(paraBanco(campos)).eq('id', id));
    },

    async excluir(id) {
      verificar(await consulta().delete().eq('id', id));
    },

    async excluirExemplos() {
      verificar(await consulta().delete().eq('demo', true));
    },

    assinar(aoMudar) {
      const canal = cliente
        .channel(`${tabela}-${Math.random().toString(16).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabela }, aoMudar)
        .subscribe();
      return () => cliente.removeChannel(canal);
    },
  };
}

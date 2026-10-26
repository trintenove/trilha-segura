// Escolhe onde os dados ficam: no Supabase (online, entre aparelhos) quando
// as variáveis estão configuradas; senão, só neste navegador.

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { criarArmazenamentoLocal } from './local.js';
import { criarArmazenamentoSupabase } from './supabase.js';

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL;
const CHAVE_SUPABASE = import.meta.env.VITE_SUPABASE_KEY;

const cliente = URL_SUPABASE && CHAVE_SUPABASE ? createClient(URL_SUPABASE, CHAVE_SUPABASE) : null;

export const MODO = cliente ? 'online' : 'local';

export function criarArmazenamento(tabela, colunas) {
  return cliente ? criarArmazenamentoSupabase(cliente, tabela, colunas) : criarArmazenamentoLocal(tabela);
}

// Lista os registros de uma tabela e se atualiza sozinha a cada alteração.
export function useRegistros(armazenamento) {
  const [estado, setEstado] = useState({ registros: [], carregando: true, erro: null });
  const pedido = useRef(0);

  useEffect(() => {
    const recarregar = () => {
      const meuPedido = ++pedido.current;
      armazenamento
        .listar()
        .then((registros) => meuPedido === pedido.current && setEstado({ registros, carregando: false, erro: null }))
        .catch((erro) => meuPedido === pedido.current && setEstado((atual) => ({ ...atual, carregando: false, erro })));
    };
    recarregar();
    const cancelar = armazenamento.assinar(recarregar);
    return () => {
      pedido.current++;
      cancelar();
    };
  }, [armazenamento]);

  return estado;
}

// Armazenamento no próprio navegador (localStorage).
// Usado quando o Supabase não está configurado: os dois apps funcionam,
// mas só se enxergam no mesmo navegador (ex.: duas abas).

export function lerLocal(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao;
  } catch {
    return padrao;
  }
}

export function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem armazenamento (ex.: janela anônima): o app continua, só não persiste.
  }
}

const novoId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Uma "tabela" guardada no navegador, com a mesma interface da versão Supabase.
export function criarArmazenamentoLocal(tabela) {
  const chave = `trilhasegura:${tabela}:v2`;
  const evento = `trilhasegura:${tabela}-alteradas`;
  const ler = () => lerLocal(chave, []);
  const salvar = (registros) => {
    gravarLocal(chave, registros);
    window.dispatchEvent(new Event(evento));
  };
  const novo = (campos) => ({ id: novoId(), criadaEm: new Date().toISOString(), ...campos });

  return {
    async listar() {
      return ler();
    },

    async inserir(campos) {
      const registro = novo(campos);
      salvar([...ler(), registro]);
      return registro;
    },

    async inserirVarias(lista) {
      salvar([...ler(), ...lista.map(novo)]);
    },

    async atualizar(id, campos) {
      salvar(ler().map((r) => (r.id === id ? { ...r, ...campos } : r)));
    },

    async excluir(id) {
      salvar(ler().filter((r) => r.id !== id));
    },

    async excluirExemplos() {
      salvar(ler().filter((r) => !r.demo));
    },

    assinar(aoMudar) {
      window.addEventListener(evento, aoMudar);
      window.addEventListener('storage', aoMudar); // alterações feitas em outra aba
      return () => {
        window.removeEventListener(evento, aoMudar);
        window.removeEventListener('storage', aoMudar);
      };
    },
  };
}

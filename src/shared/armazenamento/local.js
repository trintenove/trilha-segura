// Armazenamento no próprio navegador (localStorage).
// Usado quando o Supabase não está configurado: os dois apps funcionam,
// mas só se enxergam no mesmo navegador (ex.: duas abas).

const CHAVE = 'trilhasegura:viagens:v2';
const EVENTO = 'trilhasegura:viagens-alteradas';

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

function salvar(viagens) {
  gravarLocal(CHAVE, viagens);
  window.dispatchEvent(new Event(EVENTO));
}

const novoId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const armazenamentoLocal = {
  modo: 'local',

  async listar() {
    return lerLocal(CHAVE, []);
  },

  async inserir(campos) {
    const viagem = { id: novoId(), criadaEm: new Date().toISOString(), ...campos };
    salvar([...lerLocal(CHAVE, []), viagem]);
    return viagem;
  },

  async inserirVarias(lista) {
    salvar([...lerLocal(CHAVE, []), ...lista.map((campos) => ({ id: novoId(), criadaEm: new Date().toISOString(), ...campos }))]);
  },

  async atualizar(id, campos) {
    salvar(lerLocal(CHAVE, []).map((v) => (v.id === id ? { ...v, ...campos } : v)));
  },

  async excluir(id) {
    salvar(lerLocal(CHAVE, []).filter((v) => v.id !== id));
  },

  async excluirExemplos() {
    salvar(lerLocal(CHAVE, []).filter((v) => !v.demo));
  },

  assinar(aoMudar) {
    window.addEventListener(EVENTO, aoMudar);
    window.addEventListener('storage', aoMudar); // alterações feitas em outra aba
    return () => {
      window.removeEventListener(EVENTO, aoMudar);
      window.removeEventListener('storage', aoMudar);
    };
  },
};

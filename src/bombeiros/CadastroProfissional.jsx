import { useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import { Objetivo } from './Painel.jsx';

const CORPORACOES = ['CBMMG', 'CBMGO', 'CBMBA', 'CBMERJ', 'CBPMESP', 'CBMRS', 'Outra'];

// Cadastro do profissional. Na prova de conceito não há validação da matrícula.
export default function CadastroProfissional({ aoEntrar }) {
  const [form, setForm] = useState({ nome: '', matricula: '', corporacao: CORPORACOES[0], unidade: '' });
  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });
  const valido = form.nome.trim() && form.matricula.trim() && form.unidade.trim();

  const enviar = (evento) => {
    evento.preventDefault();
    if (valido) aoEntrar({ ...form, nome: form.nome.trim(), matricula: form.matricula.trim(), unidade: form.unidade.trim() });
  };

  return (
    <div className="cadastro-profissional">
      <Objetivo />
      <form className="cartao" onSubmit={enviar} style={{ display: 'grid', gap: 14 }}>
        <div className="linha">
          <Icone nome="sirene" tamanho={26} style={{ color: 'var(--vermelho)' }} />
          <h1 style={{ fontSize: '1.7rem', textTransform: 'uppercase' }}>Cadastro de profissional</h1>
        </div>
        <label className="campo">
          <span>Nome completo</span>
          <input className="entrada" value={form.nome} onChange={alterar('nome')} autoComplete="name" />
        </label>
        <div className="duas-colunas">
          <label className="campo">
            <span>Corporação</span>
            <select className="entrada" value={form.corporacao} onChange={alterar('corporacao')}>
              {CORPORACOES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Matrícula</span>
            <input className="entrada" value={form.matricula} onChange={alterar('matricula')} />
          </label>
        </div>
        <label className="campo">
          <span>Unidade / batalhão</span>
          <input className="entrada" value={form.unidade} onChange={alterar('unidade')} placeholder="Ex.: 3º BBM – Belo Horizonte" />
        </label>
        <button className="botao botao--largo" disabled={!valido}>
          Entrar no painel
        </button>
        <p className="pequeno suave" style={{ margin: 0 }}>
          Prova de conceito: a matrícula não é validada. Em produção, o acesso seria liberado pela corporação.
        </p>
      </form>
    </div>
  );
}

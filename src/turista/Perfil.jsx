import { useState } from 'react';
import { AvisoProvaDeConceito } from '../shared/componentes/Comuns.jsx';

// Primeiro acesso: nome e telefone do responsável. São esses dados que vão
// para os bombeiros caso ele assuma um risco acima de 80%.
export default function Perfil({ aoSalvar }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [aceite, setAceite] = useState(false);
  const valido = nome.trim().length >= 2 && telefone.replace(/\D/g, '').length >= 10 && aceite;

  const enviar = (evento) => {
    evento.preventDefault();
    if (valido) aoSalvar({ nome: nome.trim(), telefone: telefone.trim() });
  };

  return (
    <form className="pagina" onSubmit={enviar}>
      <div>
        <h1 className="titulo-tela">Bem-vindo(a)!</h1>
        <p className="suave">
          Antes de explorar as trilhas, informe seus dados. Eles só são usados pelos bombeiros em caso de risco ou emergência.
        </p>
      </div>
      <div className="cartao" style={{ display: 'grid', gap: 14 }}>
        <label className="campo">
          <span>Seu nome</span>
          <input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Ex.: Maria Souza" />
        </label>
        <label className="campo">
          <span>Telefone (com DDD)</span>
          <input
            className="entrada"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(31) 99999-9999"
          />
        </label>
        <label className="linha pequeno" style={{ alignItems: 'flex-start' }}>
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Autorizo o compartilhamento dos meus dados com o Corpo de Bombeiros para fins de prevenção e resgate.</span>
        </label>
      </div>
      <button className="botao botao--largo" disabled={!valido}>
        Começar
      </button>
      <AvisoProvaDeConceito />
    </form>
  );
}

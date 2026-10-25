import { useState } from 'react';
import Marca from '../shared/componentes/Marca.jsx';
import Icone from '../shared/componentes/Icone.jsx';
import { Carregando, ModoConexao } from '../shared/componentes/Comuns.jsx';
import { useDadosRisco } from '../shared/data/useDadosRisco.js';
import { gravarLocal, lerLocal } from '../shared/armazenamento/local.js';
import CadastroProfissional from './CadastroProfissional.jsx';
import Painel from './Painel.jsx';

const CHAVE_PROFISSIONAL = 'trilhasegura:profissional';

export default function App() {
  const dados = useDadosRisco();
  const [profissional, setProfissional] = useState(() => lerLocal(CHAVE_PROFISSIONAL, null));

  const entrar = (novo) => {
    gravarLocal(CHAVE_PROFISSIONAL, novo);
    setProfissional(novo);
  };

  const sair = () => {
    gravarLocal(CHAVE_PROFISSIONAL, null);
    setProfissional(null);
  };

  return (
    <div className="app-bombeiros">
      <header className="topo">
        <div className="topo__conteudo">
          <Marca subtitulo="Painel dos Bombeiros" />
          <div className="topo__acoes">
            <ModoConexao />
            {profissional && (
              <>
                <span className="topo__usuario">
                  <strong>{profissional.nome}</strong>
                  <span>
                    {profissional.corporacao} · Mat. {profissional.matricula}
                  </span>
                </span>
                <button className="botao botao--fantasma" onClick={sair} title="Sair" aria-label="Sair">
                  <Icone nome="sair" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="faixa-refletiva" />
      </header>

      {!profissional ? (
        <CadastroProfissional aoEntrar={entrar} />
      ) : dados.carregando ? (
        <Carregando />
      ) : dados.erro ? (
        <div className="pagina">Não foi possível carregar os dados.</div>
      ) : (
        <Painel trilhas={dados.trilhas} />
      )}
    </div>
  );
}

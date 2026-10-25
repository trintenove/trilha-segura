import { useEffect, useState } from 'react';
import Marca from '../shared/componentes/Marca.jsx';
import Icone from '../shared/componentes/Icone.jsx';
import { Carregando, ModoConexao } from '../shared/componentes/Comuns.jsx';
import { useDadosRisco } from '../shared/data/useDadosRisco.js';
import { gravarLocal, lerLocal } from '../shared/armazenamento/local.js';
import Perfil from './Perfil.jsx';
import Trilhas from './Trilhas.jsx';
import DetalheTrilha from './DetalheTrilha.jsx';
import Planejar from './Planejar.jsx';
import MinhasViagens from './MinhasViagens.jsx';
import EmBreve from './EmBreve.jsx';

const CHAVE_PERFIL = 'trilhasegura:perfil';

const ABAS = [
  { id: 'trilhas', rotulo: 'Trilhas', icone: 'mapa' },
  { id: 'viagens', rotulo: 'Minhas viagens', icone: 'mochila' },
  { id: 'cobra', rotulo: 'Picada de cobra', icone: 'cobra', emBreve: true },
];

export default function App() {
  const dados = useDadosRisco();
  const [perfil, setPerfil] = useState(() => lerLocal(CHAVE_PERFIL, null));
  const [aba, setAba] = useState('trilhas');
  // Tela aberta por cima das abas: detalhe de uma trilha ou planejamento da viagem.
  const [tela, setTela] = useState(null);

  // Cada troca de tela começa do topo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [aba, tela]);

  const salvarPerfil = (novo) => {
    gravarLocal(CHAVE_PERFIL, novo);
    setPerfil(novo);
  };

  const trilhaDaTela = tela && dados.trilhas.find((t) => t.id === tela.trilhaId);

  let conteudo;
  if (!perfil) {
    conteudo = <Perfil aoSalvar={salvarPerfil} />;
  } else if (dados.carregando) {
    conteudo = <Carregando texto="Buscando dados dos Bombeiros e da Defesa Civil…" />;
  } else if (dados.erro) {
    conteudo = <div className="pagina">Não foi possível carregar os dados. Tente novamente.</div>;
  } else if (tela?.tipo === 'detalhe' && trilhaDaTela) {
    conteudo = (
      <DetalheTrilha
        trilha={trilhaDaTela}
        aoVoltar={() => setTela(null)}
        aoPlanejar={(data) => setTela({ tipo: 'planejar', trilhaId: trilhaDaTela.id, data })}
      />
    );
  } else if (tela?.tipo === 'planejar' && trilhaDaTela) {
    conteudo = (
      <Planejar
        trilha={trilhaDaTela}
        dataInicial={tela.data}
        viagemId={tela.viagemId}
        perfil={perfil}
        aoVoltar={() => setTela({ tipo: 'detalhe', trilhaId: trilhaDaTela.id })}
        aoConcluir={() => {
          setTela(null);
          setAba('viagens');
        }}
      />
    );
  } else if (aba === 'viagens') {
    conteudo = (
      <MinhasViagens
        trilhas={dados.trilhas}
        aoExplorar={() => setAba('trilhas')}
        aoCompletar={(viagem) => setTela({ tipo: 'planejar', trilhaId: viagem.trilhaId, data: viagem.data, viagemId: viagem.id })}
      />
    );
  } else if (aba === 'cobra') {
    conteudo = <EmBreve />;
  } else {
    conteudo = (
      <Trilhas trilhas={dados.trilhas} atualizadoEm={dados.atualizadoEm} aoAbrir={(id) => setTela({ tipo: 'detalhe', trilhaId: id })} />
    );
  }

  return (
    <div className="app-turista">
      <header className="topo">
        <div className="topo__conteudo">
          <Marca subtitulo="Turismo ecológico" />
          <div className="topo__acoes">
            <ModoConexao />
          </div>
        </div>
        <div className="faixa-refletiva" />
      </header>

      <main className="app-turista__conteudo">{conteudo}</main>

      {perfil && !tela && (
        <nav className="abas" aria-label="Seções do app">
          {ABAS.map((item) => (
            <button key={item.id} className="abas__item" aria-current={aba === item.id ? 'page' : undefined} onClick={() => setAba(item.id)}>
              <Icone nome={item.icone} />
              <span>{item.rotulo}</span>
              {item.emBreve && <em className="abas__em-breve">Em breve</em>}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

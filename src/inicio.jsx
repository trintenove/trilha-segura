// Página inicial: escolha entre o app do turista e o app dos bombeiros.
import { createRoot } from 'react-dom/client';
import './shared/tema.css';
import './inicio.css';
import { Escudo } from './shared/componentes/Marca.jsx';
import Icone from './shared/componentes/Icone.jsx';

function Inicio() {
  return (
    <main className="inicio">
      <div className="inicio__marca">
        <Escudo tamanho={72} />
        <h1>Trilha Segura</h1>
        <p>Prevenção de acidentes com cabeça d'água em trilhas e cachoeiras.</p>
      </div>
      <div className="faixa-refletiva" />
      <div className="inicio__opcoes">
        <a className="inicio__opcao" href="./turista/">
          <Icone nome="mochila" tamanho={34} />
          <div>
            <h2>Sou turista</h2>
            <p>Veja o risco das trilhas e cadastre sua viagem.</p>
          </div>
          <Icone nome="seta" />
        </a>
        <a className="inicio__opcao inicio__opcao--bombeiro" href="./bombeiros/">
          <Icone nome="sirene" tamanho={34} />
          <div>
            <h2>Sou bombeiro</h2>
            <p>Painel para mobilizar recursos nas áreas de maior risco.</p>
          </div>
          <Icone nome="seta" />
        </a>
      </div>
      <p className="inicio__rodape">Prova de conceito para hackathon: dados simulados.</p>
    </main>
  );
}

createRoot(document.getElementById('raiz')).render(<Inicio />);

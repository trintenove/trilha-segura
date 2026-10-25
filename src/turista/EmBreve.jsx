import Icone from '../shared/componentes/Icone.jsx';

// Espaço reservado para a futura integração: aviso de picada de cobra.
export default function EmBreve() {
  return (
    <div className="pagina">
      <div className="cartao em-breve">
        <div className="em-breve__icone">
          <Icone nome="cobra" tamanho={44} />
        </div>
        <span className="em-breve__selo">Em breve</span>
        <h1 className="titulo-tela">Aviso de picada de cobra</h1>
        <p className="suave" style={{ margin: 0 }}>
          Em breve você poderá avisar os bombeiros sobre uma picada de cobra durante a trilha, com sua localização e orientações de primeiros socorros.
        </p>
      </div>
      <div className="cartao dicas">
        <h2>Enquanto isso, em caso de picada</h2>
        <ul>
          <li>Mantenha a vítima calma e deitada.</li>
          <li>Não corte, não chupe e não amarre o local.</li>
          <li>
            Ligue <strong>193</strong> e procure atendimento imediato.
          </li>
        </ul>
      </div>
    </div>
  );
}

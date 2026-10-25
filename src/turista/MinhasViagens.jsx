import Icone from '../shared/componentes/Icone.jsx';
import { SeloRisco } from '../shared/componentes/Risco.jsx';
import { Carregando } from '../shared/componentes/Comuns.jsx';
import { formatarDataLonga } from '../shared/datas.js';
import { cancelarViagem, idsDasMinhasViagens, resumirPessoas, useViagens } from '../shared/viagens.js';

export default function MinhasViagens({ trilhas, aoExplorar, aoCompletar }) {
  const { viagens, carregando } = useViagens();
  const minhas = idsDasMinhasViagens();
  const lista = viagens.filter((v) => minhas.includes(v.id)).sort((a, b) => a.data.localeCompare(b.data));

  if (carregando) return <Carregando />;

  const cancelar = (viagem) => {
    if (window.confirm('Cancelar esta viagem? Ela sairá também do painel dos bombeiros.')) cancelarViagem(viagem.id);
  };

  return (
    <div className="pagina">
      <h1 className="titulo-tela">Minhas viagens</h1>

      {lista.length === 0 && (
        <div className="cartao" style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
          <p className="suave" style={{ margin: 0 }}>
            Você ainda não cadastrou nenhuma viagem.
          </p>
          <button className="botao" onClick={aoExplorar}>
            Ver trilhas
          </button>
        </div>
      )}

      {lista.map((viagem) => {
        const trilha = trilhas.find((t) => t.id === viagem.trilhaId);
        const resumo = resumirPessoas(viagem.pessoas);
        const incompleta = viagem.status === 'alerta';
        return (
          <div key={viagem.id} className="cartao" style={{ display: 'grid', gap: 10 }}>
            <div className="linha entre" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2>{trilha?.nome ?? viagem.trilhaId}</h2>
                <div className="suave pequeno">{formatarDataLonga(viagem.data)}</div>
              </div>
              <SeloRisco risco={viagem.riscoNoCadastro} />
            </div>

            {viagem.sinalizadaBombeiros && (
              <div className="linha pequeno" style={{ color: 'var(--risco-critico)', fontWeight: 700 }}>
                <Icone nome="sirene" tamanho={16} /> Sinalizada aos bombeiros (potencial vítima)
              </div>
            )}

            {incompleta ? (
              <div className="faixa-alerta">
                <Icone nome="alerta" />
                <span>Reserva incompleta: informe quem vai no grupo.</span>
              </div>
            ) : (
              <div className="pequeno suave">
                {resumo.total} pessoa(s) · {resumo.criancas} criança(s) · {resumo.idosos} idoso(s) · {resumo.naoNadam} não sabe(m) nadar
              </div>
            )}

            <div className="linha" style={{ justifyContent: 'flex-end' }}>
              <button className="botao botao--secundario botao--pequeno" onClick={() => cancelar(viagem)}>
                Cancelar viagem
              </button>
              {incompleta && (
                <button className="botao botao--pequeno" onClick={() => aoCompletar(viagem)}>
                  Completar reserva
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

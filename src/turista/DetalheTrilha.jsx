import { useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import MapaRisco from '../shared/componentes/MapaRisco.jsx';
import { MedidorRisco } from '../shared/componentes/Risco.jsx';
import { nivelDoRisco, rotuloHistorico } from '../shared/risco.js';
import { formatarData } from '../shared/datas.js';

export function SeletorDeDia({ previsao, data, aoEscolher }) {
  return (
    <div className="dias" role="radiogroup" aria-label="Dia da visita">
      {previsao.map((dia, i) => {
        const nivel = nivelDoRisco(dia.risco);
        return (
          <button key={dia.data} role="radio" aria-checked={dia.data === data} className="dias__item" onClick={() => aoEscolher(dia.data)}>
            <span className="pequeno">{i === 0 ? 'Hoje' : formatarData(dia.data, { weekday: 'short' }).replace('.', '')}</span>
            <span className="dias__barra">
              <span style={{ height: `${Math.max(dia.risco, 6)}%`, background: nivel.cor }} />
            </span>
            <strong>{dia.risco}%</strong>
          </button>
        );
      })}
    </div>
  );
}

export default function DetalheTrilha({ trilha, aoVoltar, aoPlanejar }) {
  const [data, setData] = useState(trilha.hoje.data);
  const dia = trilha.previsao.find((d) => d.data === data);
  const nivel = nivelDoRisco(dia.risco);

  return (
    <div className="pagina">
      <button className="botao botao--fantasma linha" onClick={aoVoltar} style={{ justifySelf: 'start', paddingLeft: 0 }}>
        <Icone nome="voltar" /> Trilhas
      </button>

      <div>
        <h1 className="titulo-tela">{trilha.nome}</h1>
        <div className="suave">
          {trilha.cidade} · {trilha.tipo}
        </div>
      </div>

      <div className="cartao" style={{ display: 'grid', gap: 14 }}>
        <MedidorRisco risco={dia.risco} />
        <p style={{ margin: 0, textAlign: 'center' }}>{nivel.dica}</p>
        <div className="fatores">
          <div>
            <Icone nome="chuva" />
            <div>
              <strong>{dia.probChuva}%</strong>
              <div className="pequeno suave">chance de chuva · Defesa Civil de MG</div>
            </div>
          </div>
          <div>
            <Icone nome="sirene" />
            <div>
              <strong>{trilha.ocorrencias} ocorrências</strong>
              <div className="pequeno suave">histórico {rotuloHistorico(trilha.ocorrencias)} · CBMMG (5 anos)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cartao" style={{ display: 'grid', gap: 10 }}>
        <div className="linha entre">
          <h2>Próximos 7 dias</h2>
          <span className="pequeno suave">toque para escolher</span>
        </div>
        <SeletorDeDia previsao={trilha.previsao} data={data} aoEscolher={setData} />
      </div>

      <details className="cartao como-calculamos">
        <summary>Como calculamos o risco?</summary>
        <p>
          Cruzamos o <strong>histórico de ocorrências dos bombeiros</strong> no local (mostra o quanto ele é propenso a cabeça d'água) com a{' '}
          <strong>probabilidade de chuva da Defesa Civil</strong> para o dia (a chuva é o gatilho). O risco só passa de 80% quando há chuva forte prevista
          em um local com histórico alto.
        </p>
      </details>

      <MapaRisco altura={200} pontos={[{ id: trilha.id, lat: trilha.lat, lng: trilha.lng, risco: dia.risco, titulo: trilha.nome }]} />

      <div className="rodape-fixo">
        <button className="botao botao--largo" onClick={() => aoPlanejar(data)}>
          <Icone nome="calendario" /> Planejar viagem para {formatarData(data, { day: '2-digit', month: '2-digit' })}
        </button>
      </div>
    </div>
  );
}

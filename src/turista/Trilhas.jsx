import { useMemo, useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import MapaRisco from '../shared/componentes/MapaRisco.jsx';
import { BarraRisco, LegendaRisco, SeloRisco } from '../shared/componentes/Risco.jsx';
import { AvisoProvaDeConceito } from '../shared/componentes/Comuns.jsx';
import { formatarHora, tempoDecorrido } from '../shared/datas.js';

const ORDENS = {
  risco: (a, b) => b.hoje.risco - a.hoje.risco,
  nome: (a, b) => a.nome.localeCompare(b.nome),
};

export default function Trilhas({ trilhas, denuncias, atualizadoEm, aoAbrir }) {
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState('risco');
  const [visao, setVisao] = useState('mapa');

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return trilhas
      .filter((t) => !termo || `${t.nome} ${t.cidade} ${t.regiao}`.toLowerCase().includes(termo))
      .sort(ORDENS[ordem]);
  }, [trilhas, busca, ordem]);

  const criticas = trilhas.filter((t) => t.hoje.risco > 80).length;
  const ultimaDenuncia = (trilhaId) => denuncias.filter((d) => d.trilhaId === trilhaId).at(-1);

  return (
    <div className="pagina">
      <div>
        <h1 className="titulo-tela">Trilhas de Minas hoje</h1>
        <p className="suave pequeno" style={{ margin: '4px 0 0' }}>
          Atualizado às {formatarHora(atualizadoEm)} · CBMMG + Defesa Civil de MG
        </p>
      </div>

      {criticas > 0 && (
        <div className="faixa-alerta">
          <Icone nome="alerta" />
          <span>
            <strong>{criticas === 1 ? '1 local' : `${criticas} locais`} com risco crítico</strong> de cabeça d'água hoje.
          </span>
        </div>
      )}

      <div className="linha entre quebra">
        <input className="entrada" style={{ flex: '1 1 200px' }} placeholder="Buscar trilha, cidade ou região" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="alternador" role="group" aria-label="Visualização">
          <button aria-pressed={visao === 'mapa'} onClick={() => setVisao('mapa')}>
            Mapa
          </button>
          <button aria-pressed={visao === 'lista'} onClick={() => setVisao('lista')}>
            Lista
          </button>
        </div>
      </div>

      <div className="linha entre quebra">
        <LegendaRisco />
        {visao === 'lista' && (
          <select className="entrada" style={{ width: 'auto', padding: '6px 10px' }} value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
            <option value="risco">Maior risco</option>
            <option value="nome">Nome</option>
          </select>
        )}
      </div>

      {visao === 'mapa' ? (
        <MapaRisco
          altura="58vh"
          pontos={visiveis.map((t) => ({ id: t.id, lat: t.lat, lng: t.lng, risco: t.hoje.risco, titulo: t.nome, detalhe: `${t.cidade} · toque para ver` }))}
          aoSelecionar={aoAbrir}
        />
      ) : (
        <ul className="lista-trilhas">
          {visiveis.map((trilha) => (
            <li key={trilha.id}>
              <button className="cartao cartao-trilha" onClick={() => aoAbrir(trilha.id)}>
                <div className="cartao-trilha__topo">
                  <div style={{ minWidth: 0 }}>
                    <h2>{trilha.nome}</h2>
                    <div className="suave pequeno">
                      {trilha.cidade} · {trilha.regiao}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="porcentagem">{trilha.hoje.risco}%</div>
                    <SeloRisco risco={trilha.hoje.risco} comNumero={false} />
                  </div>
                </div>
                {ultimaDenuncia(trilha.id) && (
                  <div className="selo-denuncia">
                    <Icone nome="sirene" tamanho={16} /> Cabeça d'água denunciada {tempoDecorrido(ultimaDenuncia(trilha.id).criadaEm)}
                  </div>
                )}
                <BarraRisco risco={trilha.hoje.risco} />
                <div className="linha pequeno suave quebra" style={{ gap: 14 }}>
                  <span className="linha" style={{ gap: 4 }}>
                    <Icone nome="chuva" tamanho={16} /> {trilha.hoje.probChuva}% de chuva
                  </span>
                  <span className="linha" style={{ gap: 4 }}>
                    <Icone nome="sirene" tamanho={16} /> {trilha.ocorrencias} ocorrências
                  </span>
                </div>
              </button>
            </li>
          ))}
          {visiveis.length === 0 && <li className="suave">Nenhuma trilha encontrada.</li>}
        </ul>
      )}

      <AvisoProvaDeConceito />
    </div>
  );
}

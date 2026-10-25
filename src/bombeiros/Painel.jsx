import { useEffect, useMemo, useRef, useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import MapaRisco from '../shared/componentes/MapaRisco.jsx';
import { LegendaRisco, SeloRisco } from '../shared/componentes/Risco.jsx';
import { AvisoProvaDeConceito, Carregando } from '../shared/componentes/Comuns.jsx';
import { agregarPorLocalidade, totalizar } from '../shared/agregacao.js';
import { formatarData, hojeISO, somarDias } from '../shared/datas.js';
import { carregarExemplos, removerExemplos, resumirPessoas, useViagens } from '../shared/viagens.js';

const PERIODOS = [
  { dias: 1, rotulo: 'Hoje' },
  { dias: 3, rotulo: '3 dias' },
  { dias: 7, rotulo: '7 dias' },
];

export function Objetivo() {
  return (
    <section className="objetivo">
      <Icone nome="sirene" tamanho={26} />
      <p>
        <strong>Objetivo deste painel:</strong> facilitar a <strong>mobilização de recursos para as áreas de maior risco</strong> de cabeça d'água, mostrando
        onde estão os turistas que cadastraram viagem, quantos são vulneráveis e quem assumiu um risco acima de 80%.
      </p>
    </section>
  );
}

// Toque de sirene curto quando chega um alerta (Web Audio, sem arquivos).
function tocarSirene() {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    oscilador.type = 'square';
    volume.gain.value = 0.05;
    for (let i = 0; i < 4; i++) oscilador.frequency.setValueAtTime(i % 2 ? 660 : 880, audio.currentTime + i * 0.3);
    oscilador.connect(volume).connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + 1.2);
  } catch {
    // Navegador sem áudio ou bloqueado: o aviso visual continua aparecendo.
  }
  navigator.vibrate?.([300, 100, 300]);
}

// Detecta potenciais vítimas que chegaram depois que o painel foi aberto.
function useNovosAlertas(viagens, carregando) {
  const conhecidos = useRef(null);
  const [novos, setNovos] = useState([]);

  useEffect(() => {
    if (carregando) return;
    const sinalizadas = viagens.filter((v) => v.sinalizadaBombeiros && !v.demo);
    if (conhecidos.current === null) {
      conhecidos.current = new Set(sinalizadas.map((v) => v.id));
      return;
    }
    const chegaram = sinalizadas.filter((v) => !conhecidos.current.has(v.id));
    if (chegaram.length === 0) return;
    chegaram.forEach((v) => conhecidos.current.add(v.id));
    setNovos((atuais) => [...chegaram, ...atuais]);
    tocarSirene();
  }, [viagens, carregando]);

  const dispensar = (id) => setNovos((atuais) => atuais.filter((v) => v.id !== id));
  return [novos, dispensar];
}

export default function Painel({ trilhas }) {
  const { viagens, carregando, erro } = useViagens();
  const [periodo, setPeriodo] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [novosAlertas, dispensarAlerta] = useNovosAlertas(viagens, carregando);
  const itensLista = useRef({});

  const hoje = hojeISO();
  const ate = somarDias(hoje, periodo - 1);
  const localidades = useMemo(() => agregarPorLocalidade(trilhas, viagens, { de: hoje, ate }), [trilhas, viagens, hoje, ate]);
  const totais = totalizar(localidades);
  const temExemplos = viagens.some((v) => v.demo);

  const selecionar = (trilhaId) => {
    setSelecionado(trilhaId);
    itensLista.current[trilhaId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const comExemplos = (acao) => async () => {
    setProcessando(true);
    try {
      await acao();
    } catch (e) {
      console.error(e);
      window.alert('Não foi possível atualizar os dados de exemplo.');
    } finally {
      setProcessando(false);
    }
  };

  if (carregando) return <Carregando texto="Carregando viagens cadastradas…" />;

  return (
    <div className="painel">
      <Objetivo />

      {erro && <div className="aviso-poc">Erro ao ler o banco de dados: {erro.message}</div>}

      <div className="painel__barra">
        <div className="alternador" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button key={p.dias} aria-pressed={periodo === p.dias} onClick={() => setPeriodo(p.dias)}>
              {p.rotulo}
            </button>
          ))}
        </div>
        <span className="pequeno suave">
          {formatarData(hoje)}
          {periodo > 1 && ` a ${formatarData(ate)}`}
        </span>
        <div className="painel__exemplos">
          {temExemplos ? (
            <button className="botao botao--secundario botao--pequeno" onClick={comExemplos(removerExemplos)} disabled={processando}>
              <Icone nome="lixo" tamanho={16} /> Remover exemplos
            </button>
          ) : (
            <button className="botao botao--escuro botao--pequeno" onClick={comExemplos(() => carregarExemplos(trilhas))} disabled={processando}>
              Carregar dados de exemplo
            </button>
          )}
        </div>
      </div>

      <section className="indicadores">
        <Indicador icone="pessoas" valor={totais.pessoas} rotulo="pessoas com viagem cadastrada" detalhe={`em ${totais.localidades} localidade(s)`} />
        <Indicador
          icone="alerta"
          valor={totais.pessoasEmAreaCritica}
          rotulo="pessoas em áreas de risco crítico"
          detalhe={`${totais.localidadesCriticas} localidade(s) acima de 80%`}
          destaque={totais.pessoasEmAreaCritica > 0}
        />
        <Indicador
          icone="boia"
          valor={totais.vulneraveis}
          rotulo="pessoas vulneráveis"
          detalhe={`${totais.criancas} crianças · ${totais.idosos} idosos · ${totais.naoNadam} não nadam`}
        />
        <Indicador
          icone="sirene"
          valor={totais.sinalizadas}
          rotulo="potenciais vítimas"
          detalhe="assumiram risco acima de 80%"
          destaque={totais.sinalizadas > 0}
        />
      </section>

      <div className="painel__grade">
        <section className="cartao painel__mapa">
          <div className="linha entre quebra" style={{ marginBottom: 10 }}>
            <h2>Mapa de risco e pessoas</h2>
            <span className="pequeno suave">tamanho do círculo = nº de pessoas</span>
          </div>
          <MapaRisco
            altura="clamp(320px, 52vh, 560px)"
            selecionado={selecionado}
            aoSelecionar={selecionar}
            pontos={localidades.map((l) => ({
              id: l.trilha.id,
              lat: l.trilha.lat,
              lng: l.trilha.lng,
              risco: l.risco,
              raio: Math.min(36, 8 + Math.sqrt(l.total + l.gruposNaoInformados) * 4),
              titulo: l.trilha.nome,
              detalhe: `${l.total} pessoas · ${l.vulneraveis} vulneráveis${l.sinalizadas ? ` · ${l.sinalizadas} potencial(is) vítima(s)` : ''}`,
            }))}
          />
          <div style={{ marginTop: 10 }}>
            <LegendaRisco />
          </div>
        </section>

        <section className="painel__prioridades">
          <h2>Prioridade de mobilização</h2>
          {localidades.length === 0 && (
            <div className="cartao suave">
              Nenhuma viagem cadastrada para o período. {!temExemplos && 'Use "Carregar dados de exemplo" para a demonstração.'}
            </div>
          )}
          <ol className="prioridades">
            {localidades.map((localidade, posicao) => (
              <li key={localidade.trilha.id} ref={(el) => (itensLista.current[localidade.trilha.id] = el)}>
                <CartaoLocalidade
                  localidade={localidade}
                  posicao={posicao + 1}
                  aberto={selecionado === localidade.trilha.id}
                  aoAlternar={() => setSelecionado(selecionado === localidade.trilha.id ? null : localidade.trilha.id)}
                />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <AvisoProvaDeConceito />

      <div className="alertas-ao-vivo" aria-live="assertive">
        {novosAlertas.map((viagem) => {
          const trilha = trilhas.find((t) => t.id === viagem.trilhaId);
          return (
            <div key={viagem.id} className="alerta-ao-vivo" role="alert">
              <div className="linha" style={{ gap: 8 }}>
                <Icone nome="sirene" tamanho={22} />
                <strong>POTENCIAL VÍTIMA</strong>
                <span className="selo-risco" style={{ background: '#fff', color: 'var(--risco-critico)', marginLeft: 'auto' }}>
                  {viagem.riscoNoCadastro}%
                </span>
              </div>
              <p>
                <strong>{viagem.responsavel?.nome}</strong> assumiu o risco em <strong>{trilha?.nome}</strong> para {formatarData(viagem.data)}.
              </p>
              <div className="linha">
                <button
                  className="botao botao--pequeno"
                  style={{ background: '#fff', color: 'var(--risco-critico)' }}
                  onClick={() => {
                    selecionar(viagem.trilhaId);
                    dispensarAlerta(viagem.id);
                  }}
                >
                  Ver no mapa
                </button>
                <button className="botao botao--pequeno botao--fantasma" onClick={() => dispensarAlerta(viagem.id)}>
                  Dispensar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Indicador({ icone, valor, rotulo, detalhe, destaque }) {
  return (
    <div className={`indicador${destaque ? ' indicador--destaque' : ''}`}>
      <Icone nome={icone} tamanho={22} />
      <div className="indicador__valor">{valor}</div>
      <div className="indicador__rotulo">{rotulo}</div>
      <div className="indicador__detalhe">{detalhe}</div>
    </div>
  );
}

function CartaoLocalidade({ localidade, posicao, aberto, aoAlternar }) {
  const { trilha, nivel } = localidade;
  return (
    <div className={`cartao localidade${aberto ? ' localidade--aberta' : ''}`} style={{ '--cor-nivel': nivel.cor }}>
      <button className="localidade__cabecalho" onClick={aoAlternar} aria-expanded={aberto}>
        <span className="localidade__posicao">{posicao}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <strong className="localidade__nome">{trilha.nome}</strong>
          <span className="pequeno suave">
            {trilha.cidade}/{trilha.uf}
          </span>
        </span>
        <SeloRisco risco={localidade.risco} />
      </button>

      <div className="localidade__numeros">
        <Numero icone="pessoas" valor={localidade.total} rotulo="pessoas" />
        <Numero icone="crianca" valor={localidade.criancas} rotulo="crianças" />
        <Numero icone="idoso" valor={localidade.idosos} rotulo="idosos" />
        <Numero icone="boia" valor={localidade.naoNadam} rotulo="não nadam" />
      </div>

      {localidade.sinalizadas > 0 && (
        <div className="localidade__alerta">
          <Icone nome="sirene" tamanho={16} />
          {localidade.sinalizadas} potencial(is) vítima(s)
          {localidade.gruposNaoInformados > 0 && ` · ${localidade.gruposNaoInformados} sem dados do grupo`}
        </div>
      )}

      {aberto && (
        <table className="cadastros">
          <thead>
            <tr>
              <th>Data</th>
              <th>Responsável</th>
              <th>Grupo</th>
              <th>Risco</th>
            </tr>
          </thead>
          <tbody>
            {localidade.viagens.map((viagem) => {
              const grupo = resumirPessoas(viagem.pessoas);
              return (
                <tr key={viagem.id} className={viagem.sinalizadaBombeiros ? 'sinalizada' : undefined}>
                  <td>{formatarData(viagem.data, { day: '2-digit', month: '2-digit' })}</td>
                  <td>
                    {viagem.responsavel?.nome}
                    {viagem.responsavel?.telefone && (
                      <a className="cadastros__telefone" href={`tel:${viagem.responsavel.telefone.replace(/[^\d+]/g, '')}`}>
                        <Icone nome="telefone" tamanho={12} /> {viagem.responsavel.telefone}
                      </a>
                    )}
                  </td>
                  <td>
                    {viagem.status === 'alerta'
                      ? 'não informado'
                      : `${grupo.total}p${grupo.criancas ? ` · ${grupo.criancas}cr` : ''}${grupo.idosos ? ` · ${grupo.idosos}id` : ''}${grupo.naoNadam ? ` · ${grupo.naoNadam}nn` : ''}`}
                  </td>
                  <td>
                    <strong style={{ color: viagem.sinalizadaBombeiros ? 'var(--risco-critico)' : undefined }}>{viagem.risco}%</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="pequeno suave">
                p = pessoas · cr = crianças · id = idosos · nn = não sabem nadar
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

function Numero({ icone, valor, rotulo }) {
  return (
    <div className={`numero${valor > 0 && icone !== 'pessoas' ? ' numero--atencao' : ''}`}>
      <Icone nome={icone} tamanho={16} />
      <strong>{valor}</strong>
      <span>{rotulo}</span>
    </div>
  );
}

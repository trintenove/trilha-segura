import { useEffect, useMemo, useRef, useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import MapaRisco from '../shared/componentes/MapaRisco.jsx';
import { LegendaRisco, SeloRisco } from '../shared/componentes/Risco.jsx';
import { AvisoProvaDeConceito, Carregando } from '../shared/componentes/Comuns.jsx';
import { agregarPorLocalidade, totalizar } from '../shared/agregacao.js';
import { formatarData, hojeISO, somarDias, tempoDecorrido } from '../shared/datas.js';
import { carregarExemplos, removerExemplos, resumirPessoas, useViagens } from '../shared/viagens.js';
import { denunciasAbertas, marcarAtendida, rotuloSinal, useDenuncias } from '../shared/denuncias.js';

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

// Detecta registros que chegaram depois que o painel foi aberto
// (potenciais vítimas e denúncias), para avisar com som e destaque.
function useNovos(registros, carregando, interessa) {
  const conhecidos = useRef(null);
  const [novos, setNovos] = useState([]);

  useEffect(() => {
    if (carregando) return;
    const relevantes = registros.filter(interessa);
    if (conhecidos.current === null) {
      conhecidos.current = new Set(relevantes.map((r) => r.id));
      return;
    }
    const chegaram = relevantes.filter((r) => !conhecidos.current.has(r.id));
    if (chegaram.length === 0) return;
    chegaram.forEach((r) => conhecidos.current.add(r.id));
    setNovos((atuais) => [...chegaram, ...atuais]);
    tocarSirene();
  }, [registros, carregando]);

  const dispensar = (id) => setNovos((atuais) => atuais.filter((r) => r.id !== id));
  return [novos, dispensar];
}

const ehPotencialVitima = (viagem) => viagem.sinalizadaBombeiros && !viagem.demo;
const ehDenunciaAberta = (denuncia) => denuncia.status === 'aberta';

// Onde mostrar a denúncia no mapa: coordenadas do aparelho ou, sem elas, a trilha.
const posicaoDaDenuncia = (denuncia, trilha) => (denuncia.lat != null ? { lat: denuncia.lat, lng: denuncia.lng } : trilha && { lat: trilha.lat, lng: trilha.lng });

export default function Painel({ trilhas }) {
  const { viagens, carregando, erro } = useViagens();
  const { denuncias, carregando: carregandoDenuncias } = useDenuncias();
  const abertas = denunciasAbertas(denuncias);
  const [periodo, setPeriodo] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [novosAlertas, dispensarAlerta] = useNovos(viagens, carregando, ehPotencialVitima);
  const [novasDenuncias, dispensarDenuncia] = useNovos(denuncias, carregandoDenuncias, ehDenunciaAberta);
  const itensLista = useRef({});

  const hoje = hojeISO();
  const ate = somarDias(hoje, periodo - 1);
  const localidades = useMemo(() => agregarPorLocalidade(trilhas, viagens, { de: hoje, ate }, denuncias), [trilhas, viagens, hoje, ate, denuncias]);
  const totais = totalizar(localidades);
  const temExemplos = viagens.some((v) => v.demo);

  const selecionar = (id) => {
    setSelecionado(id);
    itensLista.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const marcadoresDenuncia = abertas
    .map((d) => {
      const trilha = trilhas.find((t) => t.id === d.trilhaId);
      const posicao = posicaoDaDenuncia(d, trilha);
      return posicao && { id: `denuncia-${d.id}`, ...posicao, titulo: `Denúncia: ${trilha?.nome ?? 'local informado por GPS'}`, detalhe: tempoDecorrido(d.criadaEm) };
    })
    .filter(Boolean);

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

      {abertas.length > 0 && <DenunciasAbertas denuncias={abertas} trilhas={trilhas} aoVer={selecionar} />}

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
            denuncias={marcadoresDenuncia}
            pontos={localidades.map((l) => ({
              id: l.trilha.id,
              lat: l.trilha.lat,
              lng: l.trilha.lng,
              risco: l.risco,
              raio: Math.min(20, 5 + Math.sqrt(l.total + l.gruposNaoInformados) * 2.5),
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
              Nenhuma viagem ou denúncia para o período. {!temExemplos && 'Use "Carregar dados de exemplo" para a demonstração.'}
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
        {novasDenuncias.map((denuncia) => {
          const trilha = trilhas.find((t) => t.id === denuncia.trilhaId);
          return (
            <div key={denuncia.id} className="alerta-ao-vivo alerta-ao-vivo--denuncia" role="alert">
              <div className="linha" style={{ gap: 8 }}>
                <Icone nome="alerta" tamanho={22} />
                <strong>DENÚNCIA DE CABEÇA D'ÁGUA</strong>
              </div>
              <p>
                <strong>{trilha?.nome ?? 'Local informado por GPS'}</strong>
                {denuncia.pessoasEmPerigo && ' · PESSOAS EM PERIGO'}
                <br />
                {denuncia.sinais.map(rotuloSinal).join(' · ')}
              </p>
              <div className="linha">
                <button
                  className="botao botao--pequeno"
                  style={{ background: '#fff', color: 'var(--grafite)' }}
                  onClick={() => {
                    selecionar(denuncia.trilhaId ?? `denuncia-${denuncia.id}`);
                    dispensarDenuncia(denuncia.id);
                  }}
                >
                  Ver no mapa
                </button>
                <button className="botao botao--pequeno botao--fantasma" onClick={() => dispensarDenuncia(denuncia.id)}>
                  Dispensar
                </button>
              </div>
            </div>
          );
        })}
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

function DenunciasAbertas({ denuncias, trilhas, aoVer }) {
  const [atendendo, setAtendendo] = useState(null);

  const atender = async (id) => {
    setAtendendo(id);
    try {
      await marcarAtendida(id);
    } catch (e) {
      console.error(e);
      window.alert('Não foi possível atualizar a denúncia.');
    } finally {
      setAtendendo(null);
    }
  };

  return (
    <section className="denuncias">
      <div className="denuncias__titulo">
        <Icone nome="alerta" tamanho={24} />
        <h2>Denúncias de cabeça d'água em aberto</h2>
        <span className="denuncias__contagem">{denuncias.length}</span>
      </div>
      <ul>
        {[...denuncias].reverse().map((denuncia) => {
          const trilha = trilhas.find((t) => t.id === denuncia.trilhaId);
          const telefone = denuncia.autor?.telefone;
          return (
            <li key={denuncia.id} className="denuncia">
              <div className="linha entre" style={{ alignItems: 'flex-start' }}>
                <div>
                  <strong>{trilha?.nome ?? 'Fora das trilhas mapeadas'}</strong>
                  <div className="pequeno suave">
                    {trilha ? trilha.cidade : `${denuncia.lat?.toFixed(4)}, ${denuncia.lng?.toFixed(4)}`} · {tempoDecorrido(denuncia.criadaEm)}
                  </div>
                </div>
                {denuncia.pessoasEmPerigo && <span className="denuncia__perigo">Pessoas em perigo</span>}
              </div>
              <div className="pequeno">{denuncia.sinais.map(rotuloSinal).join(' · ')}</div>
              {denuncia.observacao && <div className="pequeno denuncia__obs">“{denuncia.observacao}”</div>}
              <div className="pequeno suave linha quebra">
                Denunciante: {denuncia.autor?.nome ?? 'não informado'}
                {telefone && (
                  <a className="linha" style={{ gap: 4 }} href={`tel:${telefone.replace(/[^\d+]/g, '')}`}>
                    <Icone nome="telefone" tamanho={12} /> {telefone}
                  </a>
                )}
              </div>
              <div className="denuncia__acoes">
                <button className="botao botao--secundario botao--pequeno" onClick={() => aoVer(denuncia.trilhaId ?? `denuncia-${denuncia.id}`)}>
                  <Icone nome="mapa" tamanho={16} /> Ver no mapa
                </button>
                <button className="botao botao--escuro botao--pequeno" onClick={() => atender(denuncia.id)} disabled={atendendo === denuncia.id}>
                  <Icone nome="check" tamanho={16} /> Marcar como atendida
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
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
            {trilha.cidade} · {trilha.regiao}
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

      {localidade.denuncias > 0 && (
        <div className="localidade__alerta localidade__alerta--denuncia">
          <Icone nome="alerta" tamanho={16} />
          {localidade.denuncias} denúncia(s) de cabeça d'água em aberto
        </div>
      )}

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

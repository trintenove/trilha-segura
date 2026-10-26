// Denúncia de cabeça d'água: quem está no local avisa os bombeiros na hora.

import { useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import { enviarDenuncia, SINAIS, trilhaMaisProxima } from '../shared/denuncias.js';

// Até esta distância, a localização do aparelho é associada à trilha mais próxima.
const RAIO_TRILHA_KM = 15;

function LigarBombeiros() {
  return (
    <a className="botao botao--perigo botao--largo ligar-193" href="tel:193">
      <Icone nome="telefone" /> Ligar 193 – Bombeiros
    </a>
  );
}

export default function Denunciar({ trilhas, perfil, trilhaInicial }) {
  const [trilhaId, setTrilhaId] = useState(trilhaInicial ?? '');
  const [posicao, setPosicao] = useState(null);
  const [localizando, setLocalizando] = useState(false);
  const [avisoLocal, setAvisoLocal] = useState(null);
  const [sinais, setSinais] = useState([]);
  const [pessoasEmPerigo, setPessoasEmPerigo] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviada, setEnviada] = useState(false);

  const usarLocalizacao = () => {
    if (!navigator.geolocation) {
      setAvisoLocal('Seu aparelho não informa a localização. Escolha o local na lista.');
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocalizando(false);
        setPosicao({ lat: coords.latitude, lng: coords.longitude });
        const proxima = trilhaMaisProxima(trilhas, coords.latitude, coords.longitude);
        if (proxima && proxima.km <= RAIO_TRILHA_KM) {
          setTrilhaId(proxima.trilha.id);
          setAvisoLocal(`Localização registrada · ${proxima.km.toFixed(1)} km de ${proxima.trilha.nome}.`);
        } else {
          setTrilhaId('');
          setAvisoLocal('Localização registrada. Nenhuma trilha mapeada por perto: os bombeiros vão receber suas coordenadas.');
        }
      },
      () => {
        setLocalizando(false);
        setAvisoLocal('Não foi possível obter a localização. Escolha o local na lista.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const alternarSinal = (id) => setSinais((atuais) => (atuais.includes(id) ? atuais.filter((s) => s !== id) : [...atuais, id]));

  const valido = (trilhaId || posicao) && sinais.length > 0 && pessoasEmPerigo !== null;

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!valido) return;
    setEnviando(true);
    setErro(null);
    try {
      await enviarDenuncia({
        trilhaId: trilhaId || null,
        lat: posicao?.lat ?? null,
        lng: posicao?.lng ?? null,
        sinais,
        pessoasEmPerigo,
        observacao: observacao.trim(),
        autor: perfil,
      });
      setEnviada(true);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      setErro('Não foi possível enviar. Verifique sua conexão ou ligue 193.');
    } finally {
      setEnviando(false);
    }
  };

  const novaDenuncia = () => {
    setEnviada(false);
    setSinais([]);
    setPessoasEmPerigo(null);
    setObservacao('');
  };

  if (enviada) {
    return (
      <div className="pagina">
        <div className="cartao concluido">
          <div className="concluido__icone" style={{ background: 'var(--vermelho)' }}>
            <Icone nome="sirene" tamanho={34} />
          </div>
          <h1 className="titulo-tela">Denúncia enviada!</h1>
          <p className="suave" style={{ margin: 0 }}>
            O Corpo de Bombeiros de Minas Gerais recebeu seu aviso agora.
          </p>
        </div>
        {pessoasEmPerigo && <LigarBombeiros />}
        <div className="cartao dicas">
          <h2>Proteja-se agora</h2>
          <ul>
            <li>Saia da água e do leito do rio imediatamente.</li>
            <li>Vá para um local alto e fique longe das margens.</li>
            <li>Não tente atravessar o rio nem resgatar alguém na correnteza.</li>
            <li>Avise outras pessoas que estiverem por perto.</li>
          </ul>
        </div>
        <button className="botao botao--secundario botao--largo" onClick={novaDenuncia}>
          Fazer outra denúncia
        </button>
      </div>
    );
  }

  return (
    <form className="pagina" onSubmit={enviar}>
      <div>
        <h1 className="titulo-tela">Denunciar cabeça d'água</h1>
        <p className="suave" style={{ margin: '4px 0 0' }}>
          Viu a água subir de repente? Avise os bombeiros e as outras pessoas da região.
        </p>
      </div>

      <div className="faixa-alerta faixa-alerta--forte" style={{ alignItems: 'center' }}>
        <Icone nome="alerta" />
        <span>
          <strong>Alguém em perigo agora?</strong> Ligue antes de preencher.
        </span>
      </div>
      <LigarBombeiros />

      <div className="cartao" style={{ display: 'grid', gap: 12 }}>
        <h2>Onde?</h2>
        <button type="button" className="botao botao--escuro botao--largo" onClick={usarLocalizacao} disabled={localizando}>
          <Icone nome="mapa" /> {localizando ? 'Obtendo localização…' : 'Usar minha localização'}
        </button>
        {avisoLocal && <p className="pequeno suave" style={{ margin: 0 }}>{avisoLocal}</p>}
        <label className="campo">
          <span>ou escolha o local</span>
          <select className="entrada" value={trilhaId} onChange={(e) => setTrilhaId(e.target.value)}>
            <option value="">{posicao ? 'Outro local (usar minhas coordenadas)' : 'Selecione…'}</option>
            {trilhas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} – {t.cidade}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cartao" style={{ display: 'grid', gap: 10 }}>
        <h2>O que você está vendo?</h2>
        <div className="sinais">
          {SINAIS.map((sinal) => (
            <button key={sinal.id} type="button" aria-pressed={sinais.includes(sinal.id)} onClick={() => alternarSinal(sinal.id)}>
              {sinais.includes(sinal.id) && <Icone nome="check" tamanho={16} />} {sinal.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="cartao" style={{ display: 'grid', gap: 10 }}>
        <div className="linha entre quebra">
          <h2>Tem gente em perigo?</h2>
          <div className="alternador" role="group" aria-label="Tem gente em perigo?">
            <button type="button" aria-pressed={pessoasEmPerigo === true} onClick={() => setPessoasEmPerigo(true)}>
              Sim
            </button>
            <button type="button" aria-pressed={pessoasEmPerigo === false} onClick={() => setPessoasEmPerigo(false)}>
              Não
            </button>
          </div>
        </div>
        <label className="campo">
          <span>Detalhes (opcional)</span>
          <textarea
            className="entrada"
            rows="3"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex.: duas pessoas ilhadas na pedra, perto da trilha principal"
          />
        </label>
      </div>

      {erro && <div className="faixa-alerta">{erro}</div>}
      <button className="botao botao--largo" disabled={!valido || enviando}>
        <Icone nome="sirene" /> {enviando ? 'Enviando…' : 'Enviar denúncia aos bombeiros'}
      </button>
      {!valido && (
        <p className="pequeno suave" style={{ margin: 0, textAlign: 'center' }}>
          Informe o local, pelo menos um sinal e se há gente em perigo.
        </p>
      )}
    </form>
  );
}

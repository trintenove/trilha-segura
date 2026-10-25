// Fluxo de cadastro da viagem:
//  1. confirmar local e data (vendo o risco);
//  2. se o risco passar de 80%: "Você tem certeza?". Se o turista assumir o
//     risco, os bombeiros recebem NA HORA o alerta de potencial vítima;
//  3. reserva: dados do grupo (pessoas, idades, quem não sabe nadar);
//  4. concluído.

import { useEffect, useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import { MedidorRisco } from '../shared/componentes/Risco.jsx';
import { exigeAlertaBombeiros, LIMIAR_ALERTA_BOMBEIROS } from '../shared/risco.js';
import { formatarDataLonga } from '../shared/datas.js';
import { concluirReserva, registrarPotencialVitima, resumirPessoas } from '../shared/viagens.js';
import { SeletorDeDia } from './DetalheTrilha.jsx';

const MAX_PESSOAS = 30;
const novaPessoa = () => ({ idade: '', sabeNadar: true });

export default function Planejar({ trilha, dataInicial, viagemId: viagemExistente, perfil, aoVoltar, aoConcluir }) {
  const [etapa, setEtapa] = useState(viagemExistente ? 'reserva' : 'local');
  const [data, setData] = useState(dataInicial);
  const [confirmandoRisco, setConfirmandoRisco] = useState(false);
  const [viagemId, setViagemId] = useState(viagemExistente ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const [responsavel, setResponsavel] = useState(perfil);
  const [pessoas, setPessoas] = useState([novaPessoa()]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [etapa]);

  const dia = trilha.previsao.find((d) => d.data === data) ?? trilha.hoje;
  const risco = dia.risco;
  const alertaEnviado = Boolean(viagemId);

  const executar = async (acao) => {
    setEnviando(true);
    setErro(null);
    try {
      await acao();
    } catch (e) {
      console.error(e);
      setErro('Não foi possível enviar. Verifique sua conexão e tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const confirmarLocal = () => {
    if (exigeAlertaBombeiros(risco)) setConfirmandoRisco(true);
    else setEtapa('reserva');
  };

  const assumirRisco = () =>
    executar(async () => {
      const viagem = await registrarPotencialVitima({ trilhaId: trilha.id, data, risco, responsavel: perfil });
      setViagemId(viagem.id);
      setConfirmandoRisco(false);
      setEtapa('reserva');
    });

  const pessoasValidas = pessoas.every((p) => p.idade !== '' && Number(p.idade) >= 0 && Number(p.idade) <= 110);
  const formularioValido = pessoasValidas && responsavel.nome.trim() && responsavel.telefone.trim();

  const enviarReserva = (evento) => {
    evento.preventDefault();
    if (!formularioValido) return;
    executar(async () => {
      await concluirReserva({
        viagemId,
        trilhaId: trilha.id,
        data,
        risco,
        responsavel,
        pessoas: pessoas.map((p) => ({ idade: Number(p.idade), sabeNadar: p.sabeNadar })),
      });
      setEtapa('concluido');
    });
  };

  const mudarQuantidade = (quantidade) => {
    const alvo = Math.min(MAX_PESSOAS, Math.max(1, quantidade));
    setPessoas((atual) => (alvo > atual.length ? [...atual, ...Array.from({ length: alvo - atual.length }, novaPessoa)] : atual.slice(0, alvo)));
  };

  const alterarPessoa = (indice, campos) => setPessoas((atual) => atual.map((p, i) => (i === indice ? { ...p, ...campos } : p)));

  const resumo = resumirPessoas(pessoas.filter((p) => p.idade !== '').map((p) => ({ ...p, idade: Number(p.idade) })));

  if (etapa === 'concluido') {
    return <Concluido trilha={trilha} data={data} sinalizada={alertaEnviado || exigeAlertaBombeiros(risco)} aoContinuar={aoConcluir} />;
  }

  return (
    <div className="pagina">
      {!alertaEnviado && (
        <button className="botao botao--fantasma linha" onClick={etapa === 'reserva' ? () => setEtapa('local') : aoVoltar} style={{ justifySelf: 'start', paddingLeft: 0 }}>
          <Icone nome="voltar" /> Voltar
        </button>
      )}

      <ol className="passos">
        <li aria-current={etapa === 'local' ? 'step' : undefined}>1. Local e data</li>
        <li aria-current={etapa === 'reserva' ? 'step' : undefined}>2. Reserva</li>
        <li>3. Pronto</li>
      </ol>

      <div>
        <h1 className="titulo-tela">{trilha.nome}</h1>
        <div className="suave">
          {trilha.cidade} · {formatarDataLonga(data)}
        </div>
      </div>

      {etapa === 'local' && (
        <>
          <div className="cartao" style={{ display: 'grid', gap: 14 }}>
            <span className="rotulo">Risco de cabeça d'água no dia</span>
            <MedidorRisco risco={risco} />
            <SeletorDeDia previsao={trilha.previsao} data={data} aoEscolher={setData} />
          </div>
          {exigeAlertaBombeiros(risco) && (
            <div className="faixa-alerta">
              <Icone nome="alerta" />
              <span>
                Risco acima de {LIMIAR_ALERTA_BOMBEIROS}%. Recomendamos escolher <strong>outro dia ou outro local</strong>.
              </span>
            </div>
          )}
          <button className="botao botao--largo" onClick={confirmarLocal}>
            <Icone nome="check" /> Confirmar este local
          </button>
        </>
      )}

      {etapa === 'reserva' && (
        <form onSubmit={enviarReserva} style={{ display: 'grid', gap: 14 }}>
          {alertaEnviado && (
            <div className="faixa-alerta faixa-alerta--forte">
              <Icone nome="sirene" />
              <span>
                <strong>Corpo de Bombeiros avisado.</strong> Você foi registrado como potencial vítima. Informe quem vai com você para ajudar num eventual
                resgate.
              </span>
            </div>
          )}

          <div className="cartao" style={{ display: 'grid', gap: 12 }}>
            <h2>Responsável</h2>
            <label className="campo">
              <span>Nome</span>
              <input className="entrada" value={responsavel.nome} onChange={(e) => setResponsavel({ ...responsavel, nome: e.target.value })} />
            </label>
            <label className="campo">
              <span>Telefone</span>
              <input className="entrada" inputMode="tel" value={responsavel.telefone} onChange={(e) => setResponsavel({ ...responsavel, telefone: e.target.value })} />
            </label>
          </div>

          <div className="cartao" style={{ display: 'grid', gap: 12 }}>
            <div className="linha entre">
              <h2>Número de pessoas</h2>
              <div className="contador">
                <button type="button" onClick={() => mudarQuantidade(pessoas.length - 1)} aria-label="Menos uma pessoa">
                  −
                </button>
                <strong aria-live="polite">{pessoas.length}</strong>
                <button type="button" onClick={() => mudarQuantidade(pessoas.length + 1)} aria-label="Mais uma pessoa">
                  +
                </button>
              </div>
            </div>

            {pessoas.map((pessoa, i) => (
              <div key={i} className="pessoa">
                <span className="pessoa__nome">{i === 0 ? 'Você' : `Pessoa ${i + 1}`}</span>
                <label className="pessoa__idade">
                  <input
                    className="entrada"
                    type="number"
                    min="0"
                    max="110"
                    inputMode="numeric"
                    placeholder="Idade"
                    value={pessoa.idade}
                    onChange={(e) => alterarPessoa(i, { idade: e.target.value })}
                    aria-label={`Idade de ${i === 0 ? 'você' : `pessoa ${i + 1}`}`}
                  />
                </label>
                <div className="alternador" role="group" aria-label="Sabe nadar?">
                  <button type="button" aria-pressed={pessoa.sabeNadar} onClick={() => alterarPessoa(i, { sabeNadar: true })}>
                    Nada
                  </button>
                  <button type="button" aria-pressed={!pessoa.sabeNadar} onClick={() => alterarPessoa(i, { sabeNadar: false })}>
                    Não nada
                  </button>
                </div>
              </div>
            ))}

            <div className="resumo-grupo">
              <span className={resumo.criancas ? 'ativo' : ''}>
                <Icone nome="crianca" tamanho={16} /> {resumo.criancas} criança(s)
              </span>
              <span className={resumo.idosos ? 'ativo' : ''}>
                <Icone nome="idoso" tamanho={16} /> {resumo.idosos} idoso(s)
              </span>
              <span className={resumo.naoNadam ? 'ativo' : ''}>
                <Icone nome="boia" tamanho={16} /> {resumo.naoNadam} não sabe(m) nadar
              </span>
            </div>
          </div>

          {erro && <div className="faixa-alerta">{erro}</div>}
          <button className="botao botao--largo" disabled={!formularioValido || enviando}>
            {enviando ? 'Enviando…' : 'Confirmar reserva'}
          </button>
          {!pessoasValidas && <p className="pequeno suave" style={{ margin: 0, textAlign: 'center' }}>Informe a idade de todas as pessoas.</p>}
          {alertaEnviado && (
            <button type="button" className="botao botao--secundario botao--largo" onClick={aoConcluir}>
              Completar depois
            </button>
          )}
        </form>
      )}

      {confirmandoRisco && (
        <div className="modal-fundo" role="dialog" aria-modal="true" aria-labelledby="titulo-risco">
          <div className="modal">
            <div className="modal__topo">
              <div className="linha" style={{ gap: 10 }}>
                <Icone nome="alerta" tamanho={28} />
                <h2 id="titulo-risco" style={{ fontSize: '1.5rem' }}>
                  Você tem certeza que quer selecionar esse lugar?
                </h2>
              </div>
            </div>
            <div className="modal__corpo">
              <p style={{ margin: 0 }}>
                <strong>{trilha.nome}</strong> está com <strong>{risco}% de risco</strong> de cabeça d'água em {formatarDataLonga(data)}:{' '}
                {dia.probChuva}% de chance de chuva e {trilha.ocorrencias} ocorrências registradas pelos bombeiros.
              </p>
              <div className="faixa-alerta faixa-alerta--forte">
                <Icone nome="sirene" />
                <span>
                  Se continuar, seus dados serão <strong>enviados imediatamente ao Corpo de Bombeiros de Minas Gerais</strong> como <strong>potencial vítima</strong>.
                </span>
              </div>
              {erro && <div className="faixa-alerta">{erro}</div>}
              <button className="botao botao--secundario botao--largo" onClick={() => setConfirmandoRisco(false)} autoFocus>
                Não, escolher outro dia ou local
              </button>
              <button className="botao botao--perigo botao--largo" onClick={assumirRisco} disabled={enviando}>
                {enviando ? 'Avisando os bombeiros…' : 'Sim, assumo o risco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Concluido({ trilha, data, sinalizada, aoContinuar }) {
  return (
    <div className="pagina">
      <div className="cartao concluido">
        <div className="concluido__icone">
          <Icone nome="check" tamanho={36} />
        </div>
        <h1 className="titulo-tela">Viagem cadastrada!</h1>
        <p className="suave" style={{ margin: 0 }}>
          {trilha.nome} · {formatarDataLonga(data)}
        </p>
      </div>

      {sinalizada && (
        <div className="faixa-alerta faixa-alerta--forte">
          <Icone nome="sirene" />
          <span>Seu cadastro está no painel do Corpo de Bombeiros como potencial vítima de cabeça d'água. Redobre a atenção.</span>
        </div>
      )}

      <div className="cartao dicas">
        <h2>Sinais de cabeça d'água: saia da água na hora</h2>
        <ul>
          <li>A água fica barrenta ou turva de repente.</li>
          <li>Aparecem galhos, folhas e espuma descendo o rio.</li>
          <li>O barulho da correnteza aumenta ou o nível da água sobe.</li>
          <li>Chuva na cabeceira do rio, mesmo com sol onde você está.</li>
        </ul>
        <p style={{ margin: 0 }}>
          Vá para um <strong>local alto</strong>, longe do leito do rio, e não tente atravessar. Emergência: <strong>193</strong>.
        </p>
      </div>

      <button className="botao botao--largo" onClick={aoContinuar}>
        Ver minhas viagens
      </button>
    </div>
  );
}

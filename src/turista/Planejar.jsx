// Fluxo de cadastro da viagem:
//  1. confirmar local e data (vendo o risco);
//  2. se o risco passar de 80%: "Você tem certeza?". Se o turista assumir o
//     risco, os bombeiros recebem NA HORA o alerta de potencial vítima;
//  3. reserva: o grupo, montado como um carrinho (ex.: 2 adultos que nadam,
//     1 criança que não nada);
//  4. concluído.

import { useEffect, useState } from 'react';
import Icone from '../shared/componentes/Icone.jsx';
import { MedidorRisco } from '../shared/componentes/Risco.jsx';
import { exigeAlertaBombeiros, LIMIAR_ALERTA_BOMBEIROS } from '../shared/risco.js';
import { formatarDataLonga } from '../shared/datas.js';
import { concluirReserva, FAIXAS, registrarPotencialVitima, resumirPessoas } from '../shared/viagens.js';
import { SeletorDeDia } from './DetalheTrilha.jsx';

const MAX_PESSOAS = 30;

// Itens do "carrinho": cada faixa etária, nadando ou não.
const ITENS = FAIXAS.flatMap((faixa) => [
  { id: `${faixa.id}-nada`, faixa: faixa.id, sabeNadar: true, rotulo: faixa.rotulo, detalhe: 'nada' },
  { id: `${faixa.id}-nao-nada`, faixa: faixa.id, sabeNadar: false, rotulo: faixa.rotulo, detalhe: 'não nada' },
]);

// Começa com 1 adulto que nada (o próprio responsável).
const GRUPO_INICIAL = { 'adulto-nada': 1 };

const listarPessoas = (grupo) =>
  ITENS.flatMap((item) => Array.from({ length: grupo[item.id] ?? 0 }, () => ({ faixa: item.faixa, sabeNadar: item.sabeNadar })));

export default function Planejar({ trilha, dataInicial, viagemId: viagemExistente, perfil, aoVoltar, aoConcluir }) {
  const [etapa, setEtapa] = useState(viagemExistente ? 'reserva' : 'local');
  const [data, setData] = useState(dataInicial);
  const [confirmandoRisco, setConfirmandoRisco] = useState(false);
  const [viagemId, setViagemId] = useState(viagemExistente ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const [responsavel, setResponsavel] = useState(perfil);
  const [grupo, setGrupo] = useState(GRUPO_INICIAL);
  const pessoas = listarPessoas(grupo);

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

  const formularioValido = pessoas.length > 0 && responsavel.nome.trim() && responsavel.telefone.trim();

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
        pessoas,
      });
      setEtapa('concluido');
    });
  };

  const mudarItem = (id, delta) =>
    setGrupo((atual) => {
      const quantidade = (atual[id] ?? 0) + delta;
      if (quantidade < 0 || (delta > 0 && listarPessoas(atual).length >= MAX_PESSOAS)) return atual;
      return { ...atual, [id]: quantidade };
    });

  const resumo = resumirPessoas(pessoas);

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
            <h2>Quem vai no grupo?</h2>
            <ul className="carrinho">
              {ITENS.map((item) => {
                const quantidade = grupo[item.id] ?? 0;
                const descricao = `${item.rotulo.toLowerCase()} que ${item.detalhe}`;
                return (
                  <li key={item.id} className={!item.sabeNadar && quantidade > 0 ? 'atencao' : undefined}>
                    <span>
                      <strong>{item.rotulo}</strong>
                      <span className={item.sabeNadar ? 'suave' : 'carrinho__nao-nada'}> · {item.detalhe}</span>
                    </span>
                    <div className="contador">
                      <button type="button" onClick={() => mudarItem(item.id, -1)} disabled={quantidade === 0} aria-label={`Remover ${descricao}`}>
                        −
                      </button>
                      <strong aria-live="polite">{quantidade}</strong>
                      <button type="button" onClick={() => mudarItem(item.id, +1)} aria-label={`Adicionar ${descricao}`}>
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="carrinho__total">
              <span>Total</span>
              <strong>{pessoas.length === 1 ? '1 pessoa' : `${pessoas.length} pessoas`}</strong>
            </div>

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

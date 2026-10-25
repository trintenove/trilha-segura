// Ícones simples em SVG (traço), para não depender de bibliotecas.
const CAMINHOS = {
  chuva: 'M7 15a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 .5 7H7Zm1 3-1 2m5-2-1 2m5-2-1 2',
  sirene: 'M6 18v-6a6 6 0 0 1 12 0v6M4 18h16v3H4zM12 3V1m7.07 3.93 1.41-1.41M4.93 4.93 3.52 3.52',
  pessoas: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10v-1a6 6 0 0 1 12 0v1m3-10a3 3 0 1 0 0-6m5 16v-1a5 5 0 0 0-4-4.9',
  crianca: 'M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-4 4h8m-4 0v6m-3 5 3-5 3 5',
  idoso: 'M11 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-1 2-2 7m3-7 3 4 3 1M9 15l-2 7m4-7 2 7m5-11v11',
  boia: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.9 4.9l4.3 4.3m5.6 5.6 4.3 4.3m0-14.2-4.3 4.3m-5.6 5.6-4.3 4.3',
  mapa: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 0v16m6-14v16',
  lista: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  voltar: 'm15 18-6-6 6-6',
  seta: 'm9 18 6-6-6-6',
  alerta: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01',
  check: 'M20 6 9 17l-5-5',
  calendario: 'M3 5h18v16H3zM3 10h18M8 3v4m8-4v4',
  cobra: 'M4 18c0 2 2 3 4 3h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7a2 2 0 1 0 0-4h-3m5 1 2-1m-2 1 2 1',
  mochila: 'M6 8a6 6 0 0 1 12 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Zm3-3V3h6v2M9 13h6',
  agua: 'M2 12c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M12 3l3 4h-6l3-4Z',
  sair: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3',
  lixo: 'M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15',
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M1.5 9a15 15 0 0 1 21 0',
  telefone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z',
};

export default function Icone({ nome, tamanho = 20, ...resto }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...resto}
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}

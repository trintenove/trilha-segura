// Logotipo: escudo de bombeiro com uma onda (cabeça d'água) e montanha.
export function Escudo({ tamanho = 36 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 35 7v11c0 9.5-6.3 16.8-15 20C11.3 34.8 5 27.5 5 18V7l15-5Z" fill="#C8102E" stroke="#FFC20E" strokeWidth="2" />
      <path d="M11 22 17 13l4 5 3-3 5 7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M9.5 27c2.2 0 2.2-1.6 4.4-1.6s2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6 2.2-1.6 3.4-1.6" fill="none" stroke="#FFC20E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Marca({ subtitulo }) {
  return (
    <div className="marca">
      <Escudo />
      <div>
        <div className="marca__nome">Trilha Segura</div>
        <div className="marca__sub">{subtitulo}</div>
      </div>
    </div>
  );
}

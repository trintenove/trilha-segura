import { NIVEIS, nivelDoRisco } from '../risco.js';

export function SeloRisco({ risco, comNumero = true }) {
  const nivel = nivelDoRisco(risco);
  return (
    <span className="selo-risco" style={{ background: nivel.cor }}>
      {comNumero && `${risco}% · `}
      {nivel.rotulo}
    </span>
  );
}

export function BarraRisco({ risco }) {
  return (
    <div className="barra-risco" role="img" aria-label={`Risco ${risco}%`}>
      <span style={{ width: `${Math.max(risco, 3)}%`, background: nivelDoRisco(risco).cor }} />
    </div>
  );
}

// Medidor em meia-lua, com o número grande no centro.
export function MedidorRisco({ risco, tamanho = 200 }) {
  const nivel = nivelDoRisco(risco);
  const raio = 80;
  const comprimento = Math.PI * raio;
  return (
    <div style={{ width: tamanho, margin: '0 auto', textAlign: 'center' }}>
      <svg viewBox="0 0 200 112" width={tamanho} role="img" aria-label={`Risco de ${risco}%, nível ${nivel.rotulo}`}>
        <path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="#ebe8e3" strokeWidth="18" strokeLinecap="round" />
        <path
          d="M20 100a80 80 0 0 1 160 0"
          fill="none"
          stroke={nivel.cor}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${(comprimento * risco) / 100} ${comprimento}`}
        />
        <text x="100" y="92" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="44" fill="#1d1f24">
          {risco}%
        </text>
      </svg>
      <div style={{ color: nivel.cor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: -4 }}>
        Risco {nivel.rotulo}
      </div>
    </div>
  );
}

export function LegendaRisco() {
  return (
    <div className="legenda-risco">
      <span style={{ '--cor': NIVEIS.baixo.cor }}>Baixo &lt;30%</span>
      <span style={{ '--cor': NIVEIS.moderado.cor }}>Moderado 30–59%</span>
      <span style={{ '--cor': NIVEIS.alto.cor }}>Alto 60–80%</span>
      <span style={{ '--cor': NIVEIS.critico.cor }}>Crítico &gt;80%</span>
    </div>
  );
}

import { describe, expect, it } from 'vitest';
import { calcularRisco, exigeAlertaBombeiros, nivelDoRisco } from './risco.js';
import { agregarPorLocalidade, totalizar } from './agregacao.js';
import { resumirPessoas } from './viagens.js';

describe('calcularRisco', () => {
  it('fica entre 0 e 100', () => {
    expect(calcularRisco({ ocorrencias: 0, probChuva: 0 })).toBe(0);
    expect(calcularRisco({ ocorrencias: 99, probChuva: 100 })).toBe(100);
  });

  it('nunca zera em local com histórico alto, mesmo sem chuva', () => {
    expect(calcularRisco({ ocorrencias: 15, probChuva: 0 })).toBe(15);
  });

  it('só passa de 80% com chuva forte E histórico alto', () => {
    expect(calcularRisco({ ocorrencias: 15, probChuva: 90 })).toBeGreaterThan(80);
    expect(calcularRisco({ ocorrencias: 0, probChuva: 100 })).toBeLessThan(30);
    expect(calcularRisco({ ocorrencias: 15, probChuva: 40 })).toBeLessThan(60);
  });

  it('aumenta com mais chuva e com mais ocorrências', () => {
    expect(calcularRisco({ ocorrencias: 8, probChuva: 70 })).toBeGreaterThan(calcularRisco({ ocorrencias: 8, probChuva: 50 }));
    expect(calcularRisco({ ocorrencias: 10, probChuva: 70 })).toBeGreaterThan(calcularRisco({ ocorrencias: 5, probChuva: 70 }));
  });
});

describe('níveis e alerta', () => {
  it('classifica as faixas', () => {
    expect(nivelDoRisco(10).id).toBe('baixo');
    expect(nivelDoRisco(30).id).toBe('moderado');
    expect(nivelDoRisco(60).id).toBe('alto');
    expect(nivelDoRisco(80).id).toBe('alto');
    expect(nivelDoRisco(81).id).toBe('critico');
  });

  it('sinaliza aos bombeiros somente acima de 80%', () => {
    expect(exigeAlertaBombeiros(80)).toBe(false);
    expect(exigeAlertaBombeiros(81)).toBe(true);
  });
});

describe('agregação para os bombeiros', () => {
  const trilha = (id, riscos) => ({
    id,
    nome: id,
    previsao: riscos.map((risco, i) => ({ data: `2026-01-0${i + 1}`, risco })),
  });
  const trilhas = [trilha('a', [40, 90]), trilha('b', [70, 70]), trilha('c', [95, 95])];
  const pessoa = (idade, sabeNadar = true) => ({ idade, sabeNadar });
  const viagens = [
    { trilhaId: 'a', data: '2026-01-01', pessoas: [pessoa(30), pessoa(8, false)], sinalizadaBombeiros: false },
    { trilhaId: 'a', data: '2026-01-02', pessoas: [pessoa(65)], sinalizadaBombeiros: true },
    { trilhaId: 'a', data: '2026-01-02', status: 'alerta', pessoas: [], sinalizadaBombeiros: true },
    { trilhaId: 'b', data: '2026-01-01', pessoas: [pessoa(20), pessoa(22, false), pessoa(70)], sinalizadaBombeiros: false },
  ];

  it('conta pessoas vulneráveis sem contar a mesma pessoa duas vezes', () => {
    expect(resumirPessoas([pessoa(8, false), pessoa(65), pessoa(30)])).toEqual({
      total: 3, criancas: 1, idosos: 1, naoNadam: 1, vulneraveis: 2,
    });
  });

  it('ordena pelo maior risco e ignora locais sem viagens', () => {
    const resultado = agregarPorLocalidade(trilhas, viagens, { de: '2026-01-01', ate: '2026-01-02' });
    expect(resultado.map((l) => l.trilha.id)).toEqual(['a', 'b']);
    expect(resultado[0].risco).toBe(90);
    expect(resultado[0].sinalizadas).toBe(2);
    expect(resultado[0].gruposNaoInformados).toBe(1);
  });

  it('respeita o período escolhido', () => {
    const resultado = agregarPorLocalidade(trilhas, viagens, { de: '2026-01-01', ate: '2026-01-01' });
    expect(resultado.map((l) => l.trilha.id)).toEqual(['b', 'a']);
    expect(totalizar(resultado)).toMatchObject({ pessoas: 5, criancas: 1, idosos: 1, naoNadam: 2, vulneraveis: 3 });
  });
});

// Datas sempre no formato "AAAA-MM-DD", no fuso local do aparelho.

export function paraISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function deISO(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO() {
  return paraISO(new Date());
}

export function somarDias(iso, dias) {
  const data = deISO(iso);
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

export function formatarData(iso, opcoes = { weekday: 'short', day: '2-digit', month: '2-digit' }) {
  return deISO(iso).toLocaleDateString('pt-BR', opcoes);
}

export function formatarDataLonga(iso) {
  return formatarData(iso, { weekday: 'long', day: '2-digit', month: 'long' });
}

export function formatarHora(data) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function tempoDecorrido(isoDataHora, agora = new Date()) {
  const minutos = Math.max(0, Math.round((agora - new Date(isoDataHora)) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  return horas < 24 ? `há ${horas} h` : `há ${Math.round(horas / 24)} dia(s)`;
}

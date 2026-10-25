import Icone from './Icone.jsx';
import { armazenamento } from '../viagens.js';

export function Carregando({ texto = 'Carregando dados…' }) {
  return (
    <div className="carregando">
      <div className="giro" />
      {texto}
    </div>
  );
}

export function AvisoProvaDeConceito() {
  return (
    <div className="aviso-poc">
      <strong>Prova de conceito:</strong> ocorrências do CBMMG e previsão da Defesa Civil de MG são <strong>dados simulados</strong>.
    </div>
  );
}

// Mostra se os dados estão indo para o servidor (online) ou só neste navegador.
export function ModoConexao() {
  const online = armazenamento.modo === 'online';
  return (
    <span
      className="pequeno linha"
      title={online ? 'Dados compartilhados em tempo real (Supabase)' : 'Supabase não configurado: dados só neste navegador'}
      style={{ color: online ? '#7be0a4' : '#ffd46b', gap: 4 }}
    >
      <Icone nome="wifi" tamanho={16} />
      {online ? 'Online' : 'Local'}
    </span>
  );
}

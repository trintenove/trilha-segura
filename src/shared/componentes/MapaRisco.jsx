import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { nivelDoRisco } from '../risco.js';

const CENTRO_MINAS = [-19.8, -44.6];

// Ajusta o enquadramento para mostrar todos os pontos, ou voa até o selecionado.
function Enquadrar({ pontos, selecionado }) {
  const mapa = useMap();
  const chave = pontos.map((p) => p.id).join('|');

  useEffect(() => {
    if (pontos.length === 0) return;
    mapa.fitBounds(
      pontos.map((p) => [p.lat, p.lng]),
      // Sem animação: evita erro do Leaflet se a tela for trocada no meio dela.
      { padding: [36, 36], maxZoom: 8, animate: false },
    );
  }, [chave]);

  useEffect(() => {
    const alvo = pontos.find((p) => p.id === selecionado);
    if (alvo) mapa.flyTo([alvo.lat, alvo.lng], 9, { duration: 0.8 });
  }, [selecionado]);

  return null;
}

// pontos: [{ id, lat, lng, risco, raio, titulo, detalhe }]
export default function MapaRisco({ pontos, selecionado, aoSelecionar, altura }) {
  // Os pontos mais arriscados são desenhados por último, ficando por cima.
  const ordenados = [...pontos].sort((a, b) => a.risco - b.risco);

  return (
    <MapContainer center={CENTRO_MINAS} zoom={7} className="mapa" style={altura ? { height: altura } : undefined} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Enquadrar pontos={pontos} selecionado={selecionado} />
      {ordenados.map((ponto) => {
        const nivel = nivelDoRisco(ponto.risco);
        const critico = nivel.id === 'critico';
        return (
          <CircleMarker
            key={`${ponto.id}-${nivel.id}`}
            center={[ponto.lat, ponto.lng]}
            radius={ponto.raio ?? 10}
            pathOptions={{
              color: ponto.id === selecionado ? '#1d1f24' : critico ? nivel.cor : '#fff',
              weight: ponto.id === selecionado ? 3 : 2,
              fillColor: nivel.cor,
              fillOpacity: 0.85,
              className: critico ? 'ponto-critico' : undefined,
            }}
            eventHandlers={{ click: () => aoSelecionar?.(ponto.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{ponto.titulo}</strong>
              <br />
              Risco {ponto.risco}% · {nivel.rotulo}
              {ponto.detalhe && (
                <>
                  <br />
                  {ponto.detalhe}
                </>
              )}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

import { useEffect } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { nivelDoRisco } from '../risco.js';
import { CONTORNO_MG } from '../data/contornoMG.js';

const CENTRO_MINAS = [-19.8, -44.6];

// Marcador das denúncias de cabeça d'água ("!" amarelo pulsando).
const ICONE_DENUNCIA = L.divIcon({
  className: 'marcador-denuncia',
  html: '<span>!</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Mostra o estado de Minas inteiro, ou voa até o ponto selecionado.
function Enquadrar({ pontos, selecionado }) {
  const mapa = useMap();

  useEffect(() => {
    const alvo = pontos.find((p) => p.id === selecionado);
    if (alvo) mapa.flyTo([alvo.lat, alvo.lng], 9, { duration: 0.8 });
    // Sem animação: evita erro do Leaflet se a tela for trocada no meio dela.
    else mapa.fitBounds(CONTORNO_MG, { padding: [10, 10], animate: false });
  }, [selecionado]);

  return null;
}

// pontos: [{ id, lat, lng, risco, raio, titulo, detalhe }]
// denuncias: [{ id, lat, lng, titulo, detalhe }]
export default function MapaRisco({ pontos, denuncias = [], selecionado, aoSelecionar, altura }) {
  // Os pontos mais arriscados são desenhados por último, ficando por cima.
  const ordenados = [...pontos].sort((a, b) => a.risco - b.risco);

  return (
    <MapContainer center={CENTRO_MINAS} zoom={7} className="mapa" style={altura ? { height: altura } : undefined} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {/* Área atendida pelo app: o estado de Minas Gerais. */}
      <Polygon
        positions={CONTORNO_MG}
        interactive={false}
        pathOptions={{ color: '#c8102e', weight: 2, dashArray: '6 5', fillColor: '#c8102e', fillOpacity: 0.04 }}
      />
      <Enquadrar pontos={[...pontos, ...denuncias]} selecionado={selecionado} />
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
      {denuncias.map((denuncia) => (
        <Marker key={denuncia.id} position={[denuncia.lat, denuncia.lng]} icon={ICONE_DENUNCIA} zIndexOffset={1000}>
          <Tooltip direction="top" offset={[0, -14]}>
            <strong>{denuncia.titulo}</strong>
            <br />
            {denuncia.detalhe}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

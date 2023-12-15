import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Polyline,
  DirectionsRenderer,
  Marker,
} from 'react-google-maps';
const puntos = [
    { lat: -17.785183, lng: -63.197812 }, // Punto C (Ambulancia)
    { lat: -17.776074, lng: -63.191765 }, // Punto A (Paciente)
    { lat: -17.777394731326236, lng: -63.18569178130802 }, // Punto B (Hospital)
  ];
const ReporteTrayectoria = () => {
  const [trayectoria, setTrayectoria] = useState([]);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    const cargarMapa = () => {
      // Supongamos que tienes un arreglo de latitud y longitud que representa la trayectoria
      

      // Obtiene las instrucciones paso a paso utilizando la API de Direcciones
      const waypoints = puntos.map((punto) => `${punto.lat},${punto.lng}`).join('|');
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: `${puntos[0].lat},${puntos[0].lng}`,
          destination: `${puntos[puntos.length - 1].lat},${puntos[puntos.length - 1].lng}`,
          waypoints: puntos.slice(1, -1).map((punto) => ({ location: `${punto.lat},${punto.lng}` })),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error al obtener direcciones:', status);
          }
        }
      );

      // Actualiza el estado de la trayectoria para renderizar la línea poligonal
      setTrayectoria(puntos);
    };

    // Verifica si la API de Google Maps ya está cargada
    if (window.google && window.google.maps) {
      cargarMapa();
    } else {
      // Si no está cargada, espera a que se cargue antes de llamar a cargarMapa
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`;
      script.async = true;
      script.onload = cargarMapa;
      document.head.appendChild(script);
    }
  }, []);

  const MapaComponente = withScriptjs(
    withGoogleMap(() => (
      <GoogleMap defaultZoom={15} defaultCenter={trayectoria[0]}>
        {/* Dibuja la trayectoria como una línea poligonal en el mapa */}
        {trayectoria.length > 0 && <Polyline path={trayectoria} options={{ strokeColor: '#FF0000' }} />}
        {/* Muestra las direcciones paso a paso */}
        {directions && <DirectionsRenderer directions={directions} />}
        {/* Coloca marcadores en los puntos */}
        {trayectoria.map((punto, index) => (
          <Marker key={index} position={punto} label={String.fromCharCode(65 + index)} />
        ))}
      </GoogleMap>
    ))
  );

  return (
    <PageContainer title="Reporte de Trayectoria" description="Página de reporte de trayectoria">
      <DashboardCard>
        <Typography variant="h6" gutterBottom>
          Reporte de Trayectoria
        </Typography>
        {/* Renderiza el componente del mapa con la trayectoria */}
        <MapaComponente
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      </DashboardCard>
    </PageContainer>
  );
};

export default ReporteTrayectoria;

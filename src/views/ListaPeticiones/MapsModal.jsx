import React, { useState, useEffect } from 'react';
import { compose, withProps } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { Button } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';
import DashboardCard from '../../components/shared/DashboardCard';

const MapaComponente = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) => (
  <GoogleMap defaultZoom={15} defaultCenter={props.ubicacionUsuario || { lat: 0, lng: 0 }}>
    {/* Marcador para la ubicación del usuario en la solicitud */}
    {props.ubicacionUsuario && <Marker
      position={props.ubicacionUsuario}
      label="Afectado"
    />}
  
    {/* Marcadores de ejemplo para las ambulancias */}
    {props.ambulancias &&
      props.ambulancias.map((ambulancia, index) => (
        <Marker key={index} position={ambulancia.coordenadas} label={ambulancia.nombre}
        />
      ))}
  </GoogleMap>
));

const MapaModal = ({ onAceptar, onRechazar, coordenadasUsuario }) => {
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const coordenadasAmbulancias = [
    { nombre: "Ambulancia 1", coordenadas: { lat: -17.777944, lng: -63.185610 } },
    { nombre: "Ambulancia 2", coordenadas: { lat: -17.7664299, lng: -63.170502 } },
    { nombre: "Ambulancia 3", coordenadas: { lat: -17.7839303, lng: -63.2027819 } },
    // ... (puedes agregar más ambulancias si es necesario)
  ];
  useEffect(() => {
    // Obtener la ubicación actual del dispositivo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUbicacionActual({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error al obtener la ubicación actual:', error);
        }
      );
    } else {
      console.error('Geolocalización no es compatible en este navegador.');
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <div className="mapa-modal">
      <DashboardCard>
        <MapaComponente
          ubicacionActual={ubicacionActual}
          ubicacionUsuario={coordenadasUsuario}
          ambulancias={coordenadasAmbulancias}
        />

        <div className="modal-botones">
          <Button onClick={onAceptar}>Aceptar</Button>
          <Button onClick={onRechazar}>Rechazar</Button>
          <Button onClick={() => console.log('Mostrar ambulancias')}>Mostrar Ambulancias</Button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default MapaModal;

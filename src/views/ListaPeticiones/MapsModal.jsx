import React, { useState, useEffect } from 'react';
import { compose, withProps } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle, InfoWindow } from 'react-google-maps';
import { Button, TextField } from '@mui/material';
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
)((props) => {
  const [ambulanciasFiltradas, setAmbulanciasFiltradas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState(null);

  const handleInfoWindowClose = () => {
    setSeleccionado(null);
  };
  const handleMarkerClick = (index) => {
    setSeleccionado(index);
    setSelectedMarkerPosition(ambulanciasFiltradas[index]?.coordenadas);
    console.log(`handlemarker index: ${index}`)
    console.log(`    setSelectedMarkerPosition(props.ambulancias[index].coordenadas); ${JSON.stringify(props.ambulancias[index].coordenadas)}    `)
  }

  useEffect(() => {
    // Filtrar las ambulancias cuando las coordenadas del usuario y las ambulancias estén disponibles
    if (props.ubicacionUsuario && props.ambulancias.length > 0) {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Reemplaza con tu propia clave de API
        version: 'weekly',
        libraries: ['geometry'],
      });

      loader
        .load()
        .then((google) => {
          const filteredAmbulancias = props.ambulancias.filter((ambulancia) => {
            const distancia = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(props.ubicacionUsuario.lat, props.ubicacionUsuario.lng),
              new google.maps.LatLng(ambulancia.coordenadas.lat, ambulancia.coordenadas.lng)
            );

            return distancia <= props.radioVisualizacion;
          });

          setAmbulanciasFiltradas(filteredAmbulancias);
          setSeleccionado(null);
        })
        .catch((e) => {
          console.error('Error al cargar la API de Google Maps:', e);
        });
    }
  }, [props.ubicacionUsuario, props.ambulancias, props.radioVisualizacion]);

  return (
    <GoogleMap
      defaultZoom={15}
      defaultCenter={props.ubicacionUsuario || { lat: 0, lng: 0 }}
      ref={(map) => map && !map.hasOwnProperty('google') && setMap(map)}
    >
      {/* Marcador para la ubicación del usuario en la solicitud */}
      {props.ubicacionUsuario && (
        <Marker
          position={props.ubicacionUsuario}
          label="Afectado"
        />
      )}
      <Circle
        center={props.ubicacionUsuario}
        radius={props.radioVisualizacion}
        options={{
          fillColor: '#007BFF',
          fillOpacity: 0.3,
          strokeColor: '#007BFF',
          strokeOpacity: 0.5,
          strokeWeight: 1,
        }}
      />
      {ambulanciasFiltradas && 
        ambulanciasFiltradas.map((ambulancia, index) => (
          <Marker
            key={index}
            position={ambulancia.coordenadas}
            label={ambulancia.nombre}
            onClick={() => handleMarkerClick(index)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: seleccionado === index ? 'blue' : 'red',
              fillOpacity: 0.7,
              scale: 8,
              strokeWeight: 2,
              strokeColor: 'black',
            }}
          />
        ))}
      {/* Manejar InfoWindow */}
      {seleccionado !== null && selectedMarkerPosition && (
        <InfoWindow
          position={selectedMarkerPosition}
          onCloseClick={handleInfoWindowClose}
        >
          <div>
            <p>Categoría: {ambulanciasFiltradas[seleccionado].categoria}</p>
            <p>Placa: {ambulanciasFiltradas[seleccionado].placa}</p>
            {/* Agrega más información según tus necesidades */}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
});

const MapaModal = ({ onAceptar, onRechazar, coordenadasUsuario }) => {
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [radioVisualizacion, setRadioVisualizacion] = useState(500); // Valor predeterminado de 500 metros
  const coordenadasAmbulancias = [
    { nombre: "Ambulancia 1", categoria: "Tipo 1", placa: "ABC123", coordenadas: { lat: -17.777944, lng: -63.185610 } },
    { nombre: "Ambulancia 2", categoria: "Tipo 2", placa: "XYZ789", coordenadas: { lat: -17.7664299, lng: -63.170502 } },
    { nombre: "Ambulancia 3", categoria: "Tipo 3", placa: "123XYZ", coordenadas: { lat: -17.7839303, lng: -63.2027819 } },
    // ... (puedes agregar más ambulancias si es necesario)
  ];

  const loader = new Loader({
    apiKey: process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Reemplaza con tu propia clave de API
    version: 'weekly',
    libraries: ['geometry'],
  });
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

  const handleAceptar = () => {
    loader
      .load()
      .then((google) => {
        // Ahora, google está disponible en este ámbito
        const ambulanciasFiltradas = coordenadasAmbulancias.filter((ambulancia) => {
          const distancia = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(ubicacionActual.lat, ubicacionActual.lng),
            new google.maps.LatLng(ambulancia.coordenadas.lat, ambulancia.coordenadas.lng)
          );

          return distancia <= radioVisualizacion;
        });

        // Lógica adicional o llamadas a funciones con las ambulancias filtradas

        // Llamar a la función onAceptar con las ambulancias filtradas
        onAceptar(ambulanciasFiltradas);
      })
      .catch((e) => {
        console.error('Error al cargar la API de Google Maps:', e);
      });
  };
  const handleRadioChange = (event) => {
    // Actualizar el valor del radio de visualización cuando cambie el TextField
    const nuevoRadio = parseInt(event.target.value, 10);
    setRadioVisualizacion(isNaN(nuevoRadio) ? 0 : Math.max(0, nuevoRadio));
  };

  return (
    <div className="mapa-modal">
      <DashboardCard>
        <MapaComponente
          ubicacionActual={ubicacionActual}
          ubicacionUsuario={coordenadasUsuario}
          ambulancias={coordenadasAmbulancias}
          radioVisualizacion={radioVisualizacion}
        />
        {/* Campo de entrada para el radio de visualización */}
        <TextField
          label="Radio de visualización (metros)"
          type="number"
          value={radioVisualizacion}
          onChange={handleRadioChange}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
        />

        <div className="modal-botones">
          <Button onClick={handleAceptar}>Aceptar</Button>
          <Button onClick={onRechazar}>Rechazar</Button>
          <Button onClick={() => console.log('Mostrar ambulancias')}>Mostrar Ambulancias</Button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default MapaModal;

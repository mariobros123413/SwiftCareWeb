import React, { useState, useEffect } from 'react';
import { compose, withProps } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle, InfoWindow } from 'react-google-maps';
import { Button, Dialog, TextField, Snackbar } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';
import DashboardCard from '../../components/shared/DashboardCard';
import api from 'src/axiosInstance';

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
  const [ambulanciasUpdate, setAmbulanciasUpdate] = useState([]);
  const handleInfoWindowClose = () => {
    // Cerrar el InfoWindow
    setSeleccionado(null);
  };

  const handleMarkerClick = (index) => {
    setSeleccionado(index);
    props.onAmbulanciaSeleccionada(index);
  };
  const loader = new Loader({
    apiKey: process.env.REACT_APP_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['geometry', 'places'],
  });
  useEffect(() => {
    const loadData = async () => {
      if (props.ubicacionUsuario && props.ambulancias.length > 0) {
        try {
          const google = await loader.load();
          const directionsService = new google.maps.DirectionsService();

          const getDistanceAndDuration = (ambulancia) => {
            return new Promise(async (resolve, reject) => {
              const request = {
                origin: new google.maps.LatLng(
                  props.ubicacionUsuario.lat,
                  props.ubicacionUsuario.lng
                ),
                destination: new google.maps.LatLng(
                  ambulancia.coordenadas.lat,
                  ambulancia.coordenadas.lng
                ),
                travelMode: google.maps.TravelMode.DRIVING,
              };

              await directionsService.route(request, (response, status) => {
                if (status === 'OK') {
                  const route = response.routes[0];
                  const distance = route.legs[0].distance.text;
                  const duration = route.legs[0].duration.text;

                  resolve({ distance, duration });
                } else {
                  reject(new Error(`Error al obtener la ruta: ${status}`));
                }
              });
            });
          };

          const updateAmbulanciasData = async () => {
            const ambulanciasData = await Promise.all(
              props.ambulancias.map(async (ambulancia) => {
                try {
                  const { distance, duration } = await getDistanceAndDuration(ambulancia);
                  return {
                    ...ambulancia,
                    distanceAndDuration: { distance, duration },
                  };
                } catch (error) {
                  console.error(`Error al obtener distancia y duración para ambulancia ${ambulancia.nombre}: ${error.message}`);
                  return {
                    ...ambulancia,
                    distanceAndDuration: { distance: 'Error', duration: 'Error' },
                  };
                }
              })
            );
            console.log(`ambulanciasData : ${JSON.stringify(ambulanciasData)}`)
            setAmbulanciasFiltradas(ambulanciasData);
            setAmbulanciasUpdate(ambulanciasData);
          };

          // Obtener la distancia y duración
          await updateAmbulanciasData();

          // Filtrar las ambulancias
          const filteredAmbulancias = ambulanciasUpdate.filter((ambulancia) => {
            const distancia = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(props.ubicacionUsuario.lat, props.ubicacionUsuario.lng),
              new google.maps.LatLng(ambulancia.coordenadas.lat, ambulancia.coordenadas.lng)
            );

            return distancia <= props.radioVisualizacion;
          });
          console.log(`filteredAmbulancias : ${JSON.stringify(filteredAmbulancias)}`)
          setAmbulanciasFiltradas(filteredAmbulancias);
        } catch (e) {
          console.error('Error al cargar la API de Google Maps:', e);
        }
      }
    };

    loadData();
  }, [props.ubicacionUsuario, props.ambulancias, props.radioVisualizacion]);


  return (
    <GoogleMap
      defaultZoom={15}
      defaultCenter={props.ubicacionUsuario || { lat: 0, lng: 0 }}
      ref={(map) => map && !map.hasOwnProperty('google') && setMap(map)}
    >
      {props.ubicacionUsuario && (
        <Marker position={props.ubicacionUsuario} label="Afectado" />
      )}
      {props.ubicacionUsuario && (
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
      )}

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
          >
            {seleccionado === index && (
              <InfoWindow onCloseClick={handleInfoWindowClose}>
                <div>
                  <p>Categoría: {ambulancia.categoria || 'isNan'}</p>
                  <p>Placa: {ambulancia.placa || 'isNan'}</p>
                  <p>Distancia: {ambulancia.distanceAndDuration.distance || 'Calculando...'}</p>
                  <p>Duración: {ambulancia.distanceAndDuration.duration || 'Calculando...'}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
    </GoogleMap>
  );
});


const MapaModal = ({ onAceptar, onRechazar, item }) => { //datosSolicitud
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [radioVisualizacion, setRadioVisualizacion] = useState(500); // Valor predeterminado de 500 metros
  const [ambulanciaSeleccionada, setAmbulanciaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [open, setOpen] = useState(true); // Mantén abierto el diálogo por defecto
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const coordenadasAmbulancias = [
    { id: 1, nombre: "Ambulancia 1", categoria: "Tipo 1", placa: "ABC123", coordenadas: { lat: -17.777944, lng: -63.185610 } },
    { id: 2, nombre: "Ambulancia 2", categoria: "Tipo 2", placa: "XYZ789", coordenadas: { lat: -17.7664299, lng: -63.170502 } },
    { id: 3, nombre: "Ambulancia 3", categoria: "Tipo 3", placa: "123XYZ", coordenadas: { lat: -17.7839303, lng: -63.2027819 } },
    // ... (puedes agregar más ambulancias si es necesario)
  ];
  const handleAmbulanciaSeleccionada = (ambulancia) => {
    setAmbulanciaSeleccionada(ambulancia);
  };
  useEffect(() => {
    // Obtener la ubicación actual del dispositivo
    if (navigator.geolocation) {
      setUbicacionActual({ lat: item.latScene, lng: item.lngScene });

    } else {
      console.error('Geolocalización no es compatible en este navegador.');
    }
  }, [ambulanciaSeleccionada]); // Se ejecuta solo una vez al montar el componente

  const handleAceptar = () => {
    // const response = api.patch('solicitud/')
    if (ambulanciaSeleccionada ===null) {
      // Si no se ha seleccionado una ambulancia, establece el mensaje y no ejecutes onAceptar
      setSnackbarMessage('Seleccione una ambulancia disponible');
      setSnackbarOpen(true);
    } else {
      // Si se ha seleccionado una ambulancia, puedes realizar la lógica adicional aquí
      // const response = await api.patch(`request/responder/${item.nro}`,{
      //   "estado" : "Aceptado",
      // "ambulanciaid" : [ambulanciaSeleccionada.id]
      // })
      console.log(` ambu selecc : ${JSON.stringify(ambulanciaSeleccionada)}`)
      console.log(` mensaje selecc : ${mensaje}`)
      onAceptar(); // Llama a la función onAceptar si es necesario
      setOpen(false); // Cierra el diálogo sin realizar ninguna acción
    }

  };
  const handleRechazar = () => {
    // const response = api.patch('requests/responder/${item.nro',
    // {
    //   "Estado" : "Rechazado"
    // }
    // )
    console.log(` ambu selecc : ${JSON.stringify(ambulanciaSeleccionada)}`)
    console.log(` mensaje selecc : ${mensaje}`)
    onRechazar(); // Llama a la función onRechazar si es necesario
    setOpen(false); // Cierra el diálogo sin realizar ninguna acción

  };

  const handleRadioChange = (event) => {
    // Actualizar el valor del radio de visualización cuando cambie el TextField
    const nuevoRadio = parseInt(event.target.value, 10);
    setAmbulanciaSeleccionada(null)
    setRadioVisualizacion(isNaN(nuevoRadio) ? 0 : Math.max(0, nuevoRadio));
  };

  const handleCloseDialog = () => {
    setOpen(false); // Cierra el diálogo sin realizar ninguna acción
  };

  return (
    <div className="mapa-modal">
      <DashboardCard>
        <MapaComponente
          ubicacionActual={ubicacionActual}
          ubicacionUsuario={{ lat: item.latScene, lng: item.lngScene }} // Cambié las llaves para que sea un objeto
          ambulancias={coordenadasAmbulancias}
          radioVisualizacion={radioVisualizacion}
          onAmbulanciaSeleccionada={handleAmbulanciaSeleccionada}
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
        <TextField
          label="Mensaje de aceptación"
          type="text"
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
        />

        <div className="modal-botones">
          <Button onClick={handleAceptar}>Aceptar</Button>
          <Button onClick={handleRechazar}>Rechazar</Button>
          <Button onClick={() => console.log('Mostrar ambulancias')}>Mostrar Ambulancias</Button>
        </div>
      </DashboardCard>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Duración en milisegundos que estará abierto el Snackbar
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      />
    </div>
  );
};

export default MapaModal;
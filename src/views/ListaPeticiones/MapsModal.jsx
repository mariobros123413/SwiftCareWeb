import React, { useState, useEffect } from 'react';
import { compose, withProps } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle, InfoWindow } from 'react-google-maps';
import { Button, Dialog, TextField, Snackbar, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
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
  const [hospitales, setHospitales] = useState([]); // Agregado
  const [showHospitalInfo, setShowHospitalInfo] = useState(null);

  const handleInfoWindowClose = () => {
    // Cerrar el InfoWindow
    setSeleccionado(null);
  };

  const handleMarkerClick = (index) => {
    setSeleccionado(index);
    props.onAmbulanciaSeleccionada(index);
    props.onAmbulanciasUpdate(ambulanciasUpdate);
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
                  ambulancia.latCurrent,
                  ambulancia.lngCurrent
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

            // Filtrar las ambulancias después de la actualización de datos
            const filteredAmbulancias = ambulanciasData.filter((ambulancia) => {
              const distancia = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(props.ubicacionUsuario.lat, props.ubicacionUsuario.lng),
                new google.maps.LatLng(ambulancia.latCurrent, ambulancia.lngCurrent)
              );
              return distancia <= props.radioVisualizacion;
            });

            // Actualizar el estado con las ambulancias filtradas
            setAmbulanciasFiltradas(filteredAmbulancias);
            setAmbulanciasUpdate(ambulanciasData);
          };

          // Obtener la distancia y duración y filtrar las ambulancias
          await updateAmbulanciasData();
          setHospitales(props.hospitales);

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
            position={{ lat: ambulancia.latCurrent, lng: ambulancia.lngCurrent }}
            label={ambulancia.category.type}
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
            {hospitales &&
              hospitales.map((hospital, index) => (
                <Marker
                  key={index}
                  position={hospital.coordenadas}
                  label="H"
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/hospitals.png',
                  }}
                  onClick={() => setShowHospitalInfo(index)}
                >
                  {showHospitalInfo === index && (
                    <InfoWindow onCloseClick={() => setShowHospitalInfo(null)}>
                      <div>
                        <p>{hospital.nombre}</p>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}

            {seleccionado === index && (
              <InfoWindow onCloseClick={handleInfoWindowClose}>
                <div>
                  <p>Funcionalidades: {ambulancia.category.description || 'isNan'}</p>
                  <p>Placa: {ambulancia.plate || 'isNan'}</p>
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
  const [ambulanciasUpdate, setAmbulanciasUpdate] = useState([]);
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState('');

  const handleAmbulanciasUpdate = (ambulancias) => {
    setAmbulanciasUpdate(ambulancias);
  };
  const handleHospitalChange = (event) => {
    setHospitalSeleccionado(event.target.value);
  };
  const coordenadasAmbulancias = [
    {
      "id": "26d50572-5181-4db8-8c03-ce82c68c3f1a",
      "plate": "DI-34k1", //dsssd
      "latStop": "-23.3",
      "lngStop": "99.323",
      "latCurrent": "-17.777944",
      "lngCurrent": "-63.185610",
      "isActive": true,
      "isIdle": true,
      "createAt": "2023-11-23T22:09:14.062Z",
      "category": {
        "type": "B",
        "description": "traslado y salvataje"
      }
    },
    {
      "id": "26d50572-5181-4db8-8c03-ce82c68c3fsdsa",
      "plate": "DI-34k2", //dsssd
      "latStop": "-23.3",
      "lngStop": "99.323",
      "latCurrent": "-17.790728",
      "lngCurrent": "-63.142193",
      "isActive": true,
      "isIdle": true,
      "createAt": "2023-11-23T22:09:14.062Z",
      "category": {
        "type": "C",
        "description": "traslado y salvataje"
      }
    },
    {
      "id": "26d50572-5181-4db8-8c03-ce82c68c3fdsa",
      "plate": "DI-34k3", //dsssd
      "latStop": "-23.3",
      "lngStop": "99.323",
      "latCurrent": "-17.977944",
      "lngCurrent": "-63.185610",
      "isActive": true,
      "isIdle": true,
      "createAt": "2023-11-23T22:09:14.062Z",
      "category": {
        "type": "A",
        "description": "traslado y salvataje"
      }
    }
  ];
  function parsearCoordenadas(arrayDeObjetos) {
    return arrayDeObjetos.map((objeto) => ({
      ...objeto,
      latStop: parseFloat(objeto.latStop),
      lngStop: parseFloat(objeto.lngStop),
      latCurrent: parseFloat(objeto.latCurrent),
      lngCurrent: parseFloat(objeto.lngCurrent),
    }));
  }
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
  }, [ambulanciaSeleccionada, ambulanciasUpdate]); // Se ejecuta solo una vez al montar el componente

  const handleAceptar = async () => {
    if (!ambulanciasUpdate.length || ambulanciaSeleccionada === null) {
      // Si no hay ambulancias disponibles o no se ha seleccionado ninguna, establece el mensaje y no ejecutes onAceptar
      setSnackbarMessage('No hay ambulancias disponibles o no se ha seleccionado ninguna');
      setSnackbarOpen(true);
      return;
    }

    const reportes = ambulanciasUpdate.map((ambulancia, index) => ({
      idAmbulancia: ambulancia.id,
      distancia: ambulancia.distanceAndDuration.distance,
      tiempo: ambulancia.distanceAndDuration.duration,
      asignado: index === ambulanciaSeleccionada,
    }));
    console.log(`resportes : ${JSON.stringify(reportes)}`)
    console.log(`hospital select : ${hospitalSeleccionado}`)
    try {
      // Realiza la lógica adicional aquí, como enviar los reportes a la API
      // const response = await api.patch(`request/responder/${item.nro}`, {
      //   estado: true,
      //   ambulanciaid: ambulanciasUpdate.map((ambulancia) => ambulancia.id),
      //   distancia: ambulanciasUpdate.map((ambulancia) => ambulancia.distanceAndDuration.distance),
      //   tiempo: ambulanciasUpdate.map((ambulancia) => ambulancia.distanceAndDuration.duration),
      //   reportes: reportes,  // Aquí incluimos el array de reportes en la solicitud
      // });

      // // Imprime la respuesta de la API (si es necesario)
      // console.log('Respuesta de la API:', response);
      // const response2 = await api.patch(`/requests/response/${item.nro}`, {
      //   "estado": "Aceptado",
      //   "entidad": {
      //     "nombre": "San Juan de Dios",
      //     "coordenada": {
      //       "lat": -11213,
      //       "lng": -21312
      //     }
      //   },
      //   "idAmbulancia": ambulanciaSeleccionada.id
      // })
      // console.log('Respuesta2 de la API:', response2);

      // Llama a la función onAceptar si es necesario
      onAceptar();

      // Cierra el diálogo sin realizar ninguna acción
      setOpen(false);
    } catch (error) {
      // Manejo de errores (puedes mostrar un mensaje de error, por ejemplo)
      console.error('Error al enviar la solicitud:', error);
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

  const hospitales = [
    {
      "nombre": "Hospital Universitario Martín Dockweiler",
      "coordenadas": {
        "lat": -17.765898336900296,
        "lng": -63.19883582514552
      }
    },
    {
      "nombre": "Hospital Noel Kempff",
      "coordenadas": {
        "lat": -17.7583170212472,
        "lng": -63.18482995108533
      }
    },
    {
      "nombre": "Hospital de Clínicas Santa Cruz",
      "coordenadas": {
        "lat": -17.773860634367697,
        "lng": -63.18351219425405
      }
    },
    {
      "nombre": "Caja Petrolera de Salud Hospital Santa Cruz",
      "coordenadas": {
        "lat": -17.77628171770574,
        "lng": -63.18579132724963
      }
    },
  ]
  return (
    <div className="mapa-modal">
      <DashboardCard>
        <MapaComponente
          ubicacionActual={ubicacionActual}
          ubicacionUsuario={{ lat: item.latScene, lng: item.lngScene }} // Cambié las llaves para que sea un objeto
          ambulancias={parsearCoordenadas(coordenadasAmbulancias)}
          radioVisualizacion={radioVisualizacion}
          onAmbulanciaSeleccionada={handleAmbulanciaSeleccionada}
          onAmbulanciasUpdate={handleAmbulanciasUpdate}
          hospitales={hospitales}
          hospitalSeleccionado={hospitalSeleccionado}
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
        <FormControl fullWidth margin="normal">
          <InputLabel id="select-hospital-label">Hospital</InputLabel>
          <Select
            labelId="select-hospital-label"
            id="select-hospital"
            value={hospitalSeleccionado}
            label="Hospital"
            onChange={handleHospitalChange}
          >
            {hospitales.map((hospital, index) => (
              <MenuItem key={index} value={hospital.nombre}>
                {hospital.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="modal-botones">
          <Button onClick={handleAceptar}>Aceptar</Button>
          <Button onClick={handleRechazar}>Rechazar</Button>
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
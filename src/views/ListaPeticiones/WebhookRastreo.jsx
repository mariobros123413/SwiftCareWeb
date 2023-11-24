import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle, InfoWindow } from 'react-google-maps';

const WebhookRastreo = () => {
    const [ubicacion, setUbicacion] = useState({
        latUser: -17.776074, 
        lngUser: -63.191765,
        latScene: -17.777394731326236, 
        lngScene: -63.18569178130802,
        latAmb: -17.785183,
        lngAmb:  -63.197812,
    });

    useEffect(() => {
        // Configura la conexión para recibir actualizaciones
        // const eventSource = new EventSource("https://755a-181-115-209-197.ngrok.io/api/sse/${solicitud.nro}");
        const eventSource = new EventSource("https://755a-181-115-209-197.ngrok.io/api/accept");
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setUbicacion({
                    latUser: data.message.latUser,
                    lngUser: data.message.lngUser,
                    latScene: data.message.latScene,
                    lngScene: data.message.lngScene,
                    latAmb: data.message.latAmb,
                    lngAmb: data.message.lngAmb,
                });
                console.log(`data : ${JSON.stringify(data)}`)
            } catch (error) {
                console.error('Error al parsear datos del webhook:', error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const MapaComponente = withScriptjs(
        withGoogleMap(() => (
            <GoogleMap defaultZoom={15} defaultCenter={{ lat: ubicacion.latUser, lng: ubicacion.lngUser }}>
                {/* Marcadores para el usuario afectado, la escena y la ambulancia */}
                <Marker position={{ lat: ubicacion.latUser, lng: ubicacion.lngUser }} label="Usuario Afectado" />
                <Marker position={{ lat: ubicacion.latScene, lng: ubicacion.lngScene }} label="Hospital destino intencional" />
                <Marker position={{ lat: ubicacion.latAmb, lng: ubicacion.lngAmb }} label="Ambulancia" />
            </GoogleMap>
        ))
    );

    return (
        <PageContainer title="Rastreo en Tiempo Real" description="Página de rastreo en tiempo real">
            <DashboardCard>
                <Typography variant="h6" gutterBottom>
                    Rastreo en Tiempo Real
                </Typography>
                {/* Renderiza el componente del mapa */}
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

export default WebhookRastreo;

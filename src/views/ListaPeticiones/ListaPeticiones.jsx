import React, { useEffect, useState } from 'react';
import { Typography, Button, Dialog, Card, CardContent, CardActions, DialogTitle, DialogContent, DialogContentText, Modal, Snackbar } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import api from 'src/axiosInstance';
import MapaModal from './MapsModal';
import ReactDOM from 'react-dom';
const modalRoot = document.getElementById('modal-root') || document.createElement('div');
document.body.appendChild(modalRoot);

const ListaPeticiones = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [openDatos, setOpenDatos] = useState(false);
    const [openSolicitud, setOpenSolicitud] = useState(false);
    const localData = window.localStorage.getItem('loggedFocusEvent');
    const localDataParsed = JSON.parse(localData);
    const userData = JSON.parse(localDataParsed.userData);
    const coordenadasUsuario = { lat: 40.7128, lng: -74.0060 };

    useEffect(() => {

        // obtenerPeticiones();
    }, []);
    const obtenerPeticiones = async () => {
        try {
            const response = await api.get(`/evento/obtenerEventos/${userData.id}`);
            setSolicitudes(response.data);
        } catch (error) {
            console.error('No hay eventos:', error);
        }
    };
    const obtenerDatosPaciente = async (idpeticion) => {
        try {
            const response = await api.get(`/evento/obtenerDatosPaciente/${idpeticion}`);
            setDatosUsuario(response.data);
        } catch (error) {
            console.error('No hay eventos:', error);
        }
    }
    const handleAceptarSolicitud = () => {
        setOpenSolicitud(false);
    };

    const handleRechazarSolicitud = () => {
        setOpenSolicitud(false);
    };
    //VER SOLICITUD
    const [open, setOpen] = useState(false);
    const [datosSolicitud, setDatosSolicitud] = useState(null);

    const handleClickOpen = (solicitud) => {
        // setDatosSolicitud(solicitud);-17.776121, -63.195057
        setDatosSolicitud({ lat: -17.776121, lng: -63.195057})
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    //VER DATOS DEL PACIENTE
    const [datosUsuario, setDatosUsuario] = useState(null);

    const [openPaciente, setOpenPaciente] = useState(false);

    const handleClickOpenPaciente = (paciente) => {
        setDatosUsuario(paciente);

        setOpenPaciente(true);
    };

    const handleClosePaciente = () => {
        setOpenPaciente(false);
    };
    return (
        <PageContainer title="Lista Peticiones" description="this is Sample page">

            <DashboardCard title="Lista de Peticiones">
                {/* {Array.isArray(solicitudes) && solicitudes.length > 0 ? (
                    solicitudes.map((solicitud) => (
                        <Card key={solicitud.id} style={{ marginTop: '16px' }} >
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    ID: {solicitud.id}
                                </Typography>
                                <Typography variant="h5" component="div">
                                    Estado: {solicitud.statu}
                                </Typography>
                                <Typography color="textSecondary">
                                    Fecha: {solicitud.fecha}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleOpenDatos(solicitud.id)}>
                                    Ver datos del paciente
                                </Button>
                                <Button size="small" onClick={() => handleOpenResponder(solicitud)}>
                                    Responder solicitud
                                </Button>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography>No hay peticiones!</Typography>

                )} */}
                <Card key={1} style={{ marginTop: '16px' }} >
                    <CardContent>
                        <Typography variant="h5" component="div">
                            ID: 1
                        </Typography>
                        <Typography variant="h5" component="div">
                            Estado: Pendiente
                        </Typography>
                        <Typography color="textSecondary">
                            Fecha: 22/11/2023 17:45
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={() => handleClickOpenPaciente(1)}>
                            Ver datos del paciente
                        </Button>
                        <Button size="small" onClick={() => handleClickOpen(coordenadasUsuario)}>
                            Responder solicitud
                        </Button>
                    </CardActions>
                </Card>
            </DashboardCard>
            <Dialog
                open={openPaciente}
                onClose={handleClosePaciente}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth

            >
                <div className="modal-background">
                    {/* <div className="modal-content">
                        <Typography variant="h5" gutterBottom>
                            CI : {datosUsuario.ci}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Nombre : {datosUsuario.nombre}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Nro Celular : {datosUsuario.phone}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Grupo Sanguíneo : {datosUsuario.grupoSanguineo}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Sexo : {datosUsuario.sexo}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Seguro : {datosUsuario.seguro}
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Fecha de Nacimiento : {datosUsuario.fechaNacimiento}
                        </Typography>

                    </div> */}
                    <DialogContent>
                        <DialogContentText variant="h5" gutterBottom>
                            CI : 8230222
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Nombre : José Mario
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Nro Celular : 75540203
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Grupo Sanguíneo : ORH+
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Sexo : Masculino
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Seguro : No tiene
                        </DialogContentText>
                        <DialogContentText variant="h5" gutterBottom>
                            Fecha de Nacimiento : 17/09/2001
                        </DialogContentText>
                    </DialogContent>
                </div>
            </Dialog>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth

            >
                <MapaModal
                    onAceptar={handleAceptarSolicitud}
                    onRechazar={handleRechazarSolicitud}
                    coordenadasUsuario={datosSolicitud}
                />
            </Dialog>
        </PageContainer>
    );
};

export default ListaPeticiones;
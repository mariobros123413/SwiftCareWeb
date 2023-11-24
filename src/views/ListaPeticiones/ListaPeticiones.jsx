import React, { useEffect, useState } from 'react';
import { Typography, Button, Dialog, Card, CardContent, Link, CardActions, CardMedia, DialogContent, DialogContentText, TextField, MenuItem } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import api from 'src/axiosInstance';
import MapaModal from './MapsModal';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

const modalRoot = document.getElementById('modal-root') || document.createElement('div');
document.body.appendChild(modalRoot);

const ListaPeticiones = () => {
    const navigate = useNavigate();

    const [solicitudes, setSolicitudes] = useState([]);
    const localData = window.localStorage.getItem('loggedFocusEvent');
    const localDataParsed = JSON.parse(localData);
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');
    //VER DATOS DEL PACIENTE
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [openPaciente, setOpenPaciente] = useState(false);
    //VER SOLICITUD
    const [open, setOpen] = useState(false);
    const [datosSolicitud, setDatosSolicitud] = useState(null);
    useEffect(() => {
        // Aquí cargas tus datos, puedes reemplazar esto con tu lógica real.
        setSolicitudes([
            {
                latUser: -17.774408,
                lngUser: -63.193042,
                latScene: -17.776406,
                lngScene: -63.193042,
                address: "234234",
                photo: "scenes/photo-1700757958326-712663691.png",
                video: "scenes/video-1700757958240-877872332.mp4",
                user: {
                    "id": "5d17553f-7c06-4a8a-8427-0431fe033f4a",
                    "ci": "123456",
                    "fullName": "Nombre prueba",
                    "phone": 76666666,
                    "isResponsible": false,
                    "createAt": "2023-11-23T07:09:21.194Z"
                },
                descripcion: "Se accidentó un estudiante de la uagrm, en la av. busch",
                victimsNum: "1",
                nro: "d0f3ed68-19a5-473b-abd5-de4abf9d4c6b",
                status: "Pendiente",
                createAt: "2023-09-23T16:45:58.333Z"
            },

            {
                latUser: 32.3,
                lngUser: 32.3,
                latScene: 32.3,
                lngScene: 32.3,
                address: "567567",
                photo: "scenes/photo-1700757958326-712663691.png",
                video: "scenes/video-1700757958240-877872332.mp4",
                user: {
                    "id": "8c17553f-7c06-4a8a-8427-0431fe033f4b",
                    "ci": "654321",
                    "fullName": "Nombre ejemplo",
                    "phone": 75555555,
                    "isResponsible": true,
                    "createAt": "2023-11-23T08:09:21.194Z"
                },
                descripcion: "Descripción de la escena",
                victimsNum: 2,
                nro: "e1f3ed68-19a5-473b-abd5-de4abf9d4c6c",
                status: "Aceptado",
                createAt: "2023-09-16T17:45:58.333Z"
            },
            {
                latUser: 32.3,
                lngUser: 32.3,
                latScene: 32.3,
                lngScene: 32.3,
                address: "999999",
                photo: "scenes/photo-1700757958326-712663691.png",
                video: "scenes/video-1700757958240-877872332.mp4",
                user: {
                    "id": "bc17553f-7c06-4a8a-8427-0431fe033f4c",
                    "ci": "789012",
                    "fullName": "Nombre de prueba",
                    "phone": 74444444,
                    "isResponsible": false,
                    "createAt": "2023-11-23T09:09:21.194Z"
                },
                descripcion: "Otra descripción de la escena",
                victimsNum: 1,
                nro: "g2f3ed68-19a5-473b-abd5-de4abf9d4c6d",
                status: "Rechazado",
                createAt: "2023-07-23T18:45:58.333Z"
            },
            {
                latUser: 32.3,
                lngUser: 32.3,
                latScene: 32.3,
                lngScene: 32.3,
                address: "123123",
                photo: "scenes/photo-1700757958326-712663691.png",
                video: "scenes/video-1700757958240-877872332.mp4",
                user: {
                    "id": "ec17553f-7c06-4a8a-8427-0431fe033f4d",
                    "ci": "345678",
                    "fullName": "Nombre de ejemplo",
                    "phone": 73333333,
                    "isResponsible": true,
                    "createAt": "2023-11-23T10:09:21.194Z"
                },
                descripcion: "Descripción adicional de la escena",
                victimsNum: 3,
                nro: "k3f3ed68-19a5-473b-abd5-de4abf9d4c6e",
                status: "Finalizado",
                createAt: "2023-11-23T19:45:58.333Z"
            }
        ]);
        // obtenerPeticiones();
    }, []);
    const obtenerPeticiones = async () => {
        try {
            const response = await api.get(`/requests`);
            setSolicitudes(response.data);
        } catch (error) {
            console.error('No hay eventos:', error);
        }
    };
    const obtenerDatosPaciente = async (idpeticion) => {
        try {
            const response = await api.get(`/requests/obtenerDatosPaciente/${idpeticion}`);
            setDatosUsuario(response.data);
        } catch (error) {
            console.error('No hay eventos:', error);
        }
    }
    const handleAceptarSolicitud = () => {
        setOpen(false);
        // window.location.reload();
    };

    const handleRechazarSolicitud = () => {
        try {
            const response = api.patch(`/requests/rechazarSolicitud/${datosSolicitud.id}`, {
                "estado": "Rechazado"
            });
            console.log(`datosSolicitud :${JSON.stringify(response)}`)
            setOpen(false);
            // window.location.reload();
        } catch (error) {
            console.log(`se encontró error handleRechazarSolicitud :${error}`)
        }
    };
    const filtrarSolicitudes = (solicitudes) => {
        return solicitudes.filter((solicitud) => {
            const estadoMatch = filtroEstado === 'Todos' || solicitud.status === filtroEstado;
            const fechaInicioMatch =
                filtroFechaInicio === '' || new Date(solicitud.createAt) >= new Date(filtroFechaInicio);
            const fechaFinMatch =
                filtroFechaFin === '' || new Date(solicitud.createAt) <= new Date(filtroFechaFin);

            return estadoMatch && fechaInicioMatch && fechaFinMatch;
        });
    };


    const handleClickOpen = (item) => {
        // setDatosSolicitud(solicitud);-17.776121, -63.195057
        setDatosSolicitud(item);
        setOpen(true);
    };
    const handleClickOpenRastreo = (item) => {
        // setDatosSolicitud(solicitud);-17.776121, -63.195057
        navigate(`/webhook/${item}`);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickOpenPaciente = (itemData, user) => {
        console.log(`datos datosSolicitud : ${JSON.stringify(itemData)}`)
        setDatosUsuario(user);
        setDatosSolicitud(itemData)
        setOpenPaciente(true);
    };

    const handleClosePaciente = () => {
        setOpenPaciente(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendiente':
                return 'orange';
            case 'Rechazado':
                return 'red';
            case 'Aceptado':
                return 'green';
            case 'Finalizado':
                return 'grey';
            default:
                return 'white'; // Color predeterminado si no coincide con ninguno de los estados anteriores
        }
    };
    return (
        <PageContainer title="Lista Peticiones" description="this is Sample page">

            <DashboardCard title="Lista de Peticiones">
                <div style={{ marginBottom: '16px' }}>
                    <TextField
                        select
                        label="Filtrar por Estado"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <MenuItem value="Todos">Todos</MenuItem>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Rechazado">Rechazado</MenuItem>
                        <MenuItem value="Aceptado">Aceptado</MenuItem>
                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                    </TextField>
                    <TextField
                        label="Filtrar por Fecha Inicio"
                        type="date"
                        value={filtroFechaInicio}
                        onChange={(e) => setFiltroFechaInicio(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Filtrar por Fecha Fin"
                        type="date"
                        value={filtroFechaFin}
                        onChange={(e) => setFiltroFechaFin(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                {Array.isArray(solicitudes) && solicitudes.length > 0 ? (
                    filtrarSolicitudes(solicitudes).map((item) => (
                        <Card
                            key={item.nro}
                            style={{
                                marginTop: '16px',
                                backgroundColor: getStatusColor(item.status),
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" component="div" style={{ color: 'white' }}>
                                    ID: {item.nro}
                                </Typography>
                                <Typography variant="h5" component="div" style={{ color: 'white' }}>
                                    Estado: {item.status}
                                </Typography>
                                <Typography color="textSecondary" style={{ color: 'white' }}>
                                    Fecha: {new Date(item.createAt).toLocaleString()} {/* Parsea la fecha aquí */}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {/* Botones condicionales */}
                                {item.status === 'Pendiente' && (
                                    <>
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpen(item)}
                                            style={{ backgroundColor: 'green', color: 'white' }}
                                        >
                                            Responder solicitud
                                        </Button>
                                    </>
                                )}
                                {item.status === 'Aceptado' && (
                                    <>
                                        {/* <Link component={RouterLink} to={`/actualizaciones/${item.id}`}>*/}
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpenRastreo(item.nro)}
                                            style={{ backgroundColor: 'purple', color: 'white' }}
                                        >
                                            Mostrar Actualizaciones
                                        </Button>
                                        {/*</Link> */}
                                    </>
                                )}
                                {item.status === 'Finalizado' && (
                                    <>
                                        {/* <Link component={RouterLink} to={`/actualizaciones/${item.id}`}>*/}
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button>
                                        <Button
                                            size="small"
                                            style={{ backgroundColor: 'purple', color: 'white' }}
                                        >
                                            Mostrar la Trayectoria
                                        </Button>
                                        {/*</Link> */}
                                    </>
                                )}
                                {item.status === 'Rechazado' && (
                                    <>
                                        {/* <Link component={RouterLink} to={`/actualizaciones/${item.id}`}>*/}
                                        <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button>
                                        <Button
                                            size="small"
                                            style={{ backgroundColor: 'purple', color: 'white' }}
                                        >
                                            Mostrar Motivos del rechazo
                                        </Button>
                                        {/*</Link> */}
                                    </>
                                )}
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography>No hay peticiones!</Typography>
                )}
            </DashboardCard>
            {datosUsuario && (
                < Dialog
                    open={openPaciente}
                    onClose={handleClosePaciente}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                >
                    <div className="modal-background">
                        <div className="modal-content">
                            <DialogContent>
                                <DialogContentText variant="h5" gutterBottom>
                                    ID Solicitud : {datosUsuario.id}
                                </DialogContentText>
                                <DialogContentText variant="h5" gutterBottom>
                                    CI : {datosUsuario.ci}
                                </DialogContentText>
                                <DialogContentText variant="h5" gutterBottom>
                                    Nombre : {datosUsuario.fullName}
                                </DialogContentText>
                                <DialogContentText variant="h5" gutterBottom>
                                    Nro Celular : {datosUsuario.phone}
                                </DialogContentText>
                            </DialogContent>
                            <img
                                src={`http://localhost:3001/${datosSolicitud.photo}`}
                                alt={`Foto de ${datosUsuario.fullName}`}
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </div>
                    </div>
                </Dialog>
            )
            }
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="xl"  // Puedes experimentar con otros valores según tus necesidades (xs, sm, md, lg, xl)

            >

                <MapaModal
                    onAceptar={handleAceptarSolicitud}
                    onRechazar={handleRechazarSolicitud}
                    item={datosSolicitud} //datosSolicitud.coordenadas
                />
            </Dialog>
        </PageContainer >
    );
};

export default ListaPeticiones;
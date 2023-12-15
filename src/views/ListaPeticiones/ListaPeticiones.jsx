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
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroDireccion, setFiltroDireccion] = useState('');

    //VER DATOS DEL PACIENTE
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [openPaciente, setOpenPaciente] = useState(false);
    //VER SOLICITUD
    const [open, setOpen] = useState(false);
    const [datosSolicitud, setDatosSolicitud] = useState(null);
    useEffect(() => {
        obtenerPeticiones();
        const eventSource = new EventSource("http://192.168.6.159:3001/api/sse");
        eventSource.onmessage = (event) => {
            console.log(`nueva solicitud : ${(JSON.parse(event.data).message)}`)
            const obje = JSON.parse(event.data).message;
            try {
                const data = (event.data);
                setSolicitudes((prevSolicitudes) => [...prevSolicitudes, obje]);

            } catch (error) {
                console.error('Error al parsear datos del webhook:', error);
            }
        };
        return () => {
            eventSource.close();
        };

    }, []);
    const obtenerPeticiones = async () => {
        try {
            const response = await api.get(`/request`);
            console.log(`response : ${JSON.stringify(response.data)}`)
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
            const descripcionMatch =
                filtroDescripcion === '' ||
                solicitud.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase()) ||
                solicitud.address.toLowerCase().includes(filtroDescripcion.toLowerCase());

            return estadoMatch && fechaInicioMatch && fechaFinMatch && descripcionMatch;
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
    const handleOpen = (item) => {
        navigate(`/peticiones/${item.nro}`)
    }
    const handleClosePaciente = () => {
        setOpenPaciente(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente':
                return '#DCA61F'; // Naranja
            case 'rechazado':
                return '#CF402A'; // Rojo
            case 'Aceptado':
                return '#2ACF2A'; // Verde
            case 'Finalizado':
                return '#698999'; // Gris
            default:
                return '#FFFFFF'; // Color predeterminado si no coincide con ninguno de los estados anteriores (Blanco)
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
                        label="Buscar por Descripción"
                        value={filtroDescripcion}
                        onChange={(e) => setFiltroDescripcion(e.target.value)}
                        fullWidth
                    />
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
                                {/* <Typography variant="h5" component="div" style={{ color: 'white' }}>
                                    Direccion: {item.address}
                                </Typography> */}
                                <Typography variant="h5" component="div" style={{ color: 'white' }}>
                                    Estado: {item.status}
                                </Typography>
                                <Typography variant="h5" component="div" style={{ color: 'white' }}>
                                    Descripción : {item.description}
                                </Typography>
                                <Typography color="textSecondary" style={{ color: 'white' }}>
                                    Fecha: {new Date(item.createAt).toLocaleString()} {/* Parsea la fecha aquí */}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {/* Botones condicionales */}
                                {item.status === 'pendiente' && (
                                    <>
                                        {/* <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button> */}
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
                                        {/* <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button> */}
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
                                {item.status === 'finalizado' && (
                                    <>
                                        {/* <Link component={RouterLink} to={`/actualizaciones/${item.id}`}>*/}
                                        {/* <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button> */}
                                        <Button
                                            size="small"
                                            onClick={() => handleOpen(item)}
                                            style={{ backgroundColor: 'purple', color: 'white' }}
                                        >
                                            Mostrar la Trayectoria
                                        </Button>
                                        {/*</Link> */}
                                    </>
                                )}
                                {item.status === 'rechazado' && (
                                    <>
                                        {/* <Link component={RouterLink} to={`/actualizaciones/${item.id}`}>*/}
                                        {/* <Button
                                            size="small"
                                            onClick={() => handleClickOpenPaciente(item, item.user)}
                                            style={{ backgroundColor: 'blue', color: 'white' }}
                                        >
                                            Ver datos del solicitante
                                        </Button> */}
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
                                src={`${datosSolicitud.photo}`}
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
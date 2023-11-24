import React, { useState, useEffect } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Button,
    Card,
    CardContent,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Modal,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { GoogleMap, Marker, InfoWindow, LoadScript, withGoogleMap } from '@react-google-maps/api';
import api from 'src/axiosInstance';
import { useParams } from 'react-router-dom';

const ambulancias = [
    {
        id: '1',
        plate: 'ABC123',
        "latStop": -23.3,
        "lngStop": 99.323,
        "latCurrent": -17.777944,
        "lngCurrent": -63.185610,
        isActive: true,
        isIdle: false,
        category: 'Tipo 1',
        // ... otros atributos
    },
    {
        id: '2',
        plate: 'XYZ789',
        "latStop": -23.3,
        "lngStop": 99.323,
        "latCurrent": -17.790728,
        "lngCurrent": -63.142193,
        isActive: false,
        isIdle: true,
        category: 'Tipo 2',
        // ... otros atributos
    },
    {
        id: '3',
        plate: 'DEF456',
        "latStop": -23.3,
        "lngStop": 99.323,
        "latCurrent": -17.977944,
        "lngCurrent": -63.185610,
        isActive: true,
        isIdle: true,
        category: 'Tipo 3',
        // ... otros atributos
    },
    {
        id: '4',
        plate: 'GHI789',
        "latStop": -22.3,
        "lngStop": 98.323,
        "latCurrent": -16.977944,
        "lngCurrent": -62.185610,
        isActive: false,
        isIdle: false,
        category: 'Tipo 1',
        // ... otros atributos
    },
    // Agrega más objetos según sea necesario
];

// Resto del código...


const ListaAmbulancia = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [empresas, setEmpresas] = useState([])
    const { empresaId } = useParams();

    useEffect(() => {
        // obtenerAmbulancias();
    }, []);
    const obtenerAmbulancias = async () => {
        try {
            const response = await api.get(`/ambulance/enterprise/:empresaId`);
            console.log(`responses  : ${(JSON.stringify(response))}`);
            setEmpresas(response.data);
        } catch (error) {
            console.log(`error: ${error}`)
        }
    }
    const [newAmbulancia, setNewAmbulancia] = useState({
        plate: '',
        responsible: ''
        // ... otros atributos
    });
    const [newCategory, setNewCategory] = useState({
        type: '',
        description: ''
        // ... otros atributos
    });
    const handleMarkerClick = (ambulancia) => {
        setSelectedAmbulance(ambulancia);
    };
    const handleMarkerClose = (ambulancia) => {
        // Puedes manejar el cierre del marcador aquí
        // Por ahora, simplemente deseleccionamos la ambulancia
        setSelectedAmbulance(null);
    };
    const handleInfoWindowClose = () => {
        setSelectedAmbulance(null);
    };
    const handleDetailsClick = (id) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };

    const handleFilterChange = (event) => {
        setFilterCategory(event.target.value);
    };

    const handleCreateDialogOpen = () => {
        setOpenCreateDialog(true);
    };
    const [showMap, setShowMap] = useState(false);

    const handleShowMap = () => {
        setShowMap(true);
    };

    const handleCloseMap = () => {
        setShowMap(false);
    };

    const handleCreateDialogClose = () => {
        setOpenCreateDialog(false);
        setNewAmbulancia({
            plate: '',
            latStop: -17.782295, 
            lngStop: -63.181963,
            isActive: false,
            isIdle: true,
            // ... otros atributos
        });
    };
    const mapContainerStyle = {
        height: '400px',
        width: '100%',
    };

    const [initialCenter] = useState({
        lat: -17.782295, // Coloca aquí la latitud inicial del mapa
        lng: -63.181963, // Coloca aquí la longitud inicial del mapa
    });
    const [center, setCenter] = useState(initialCenter);

    const handleCreateAmbulancia = () => {
        // Verificar si todos los campos están llenos
        if (!newAmbulancia.plate || !newAmbulancia.responsible) {
            // Mostrar alerta si algún campo está vacío
            alert('Todos los campos obligatorios deben ser llenados');
        } else {
            // Aquí puedes enviar la nueva ambulancia al servidor o realizar la lógica necesaria
            console.log('Nueva Ambulancia:', newAmbulancia);
            console.log('Nueva newCategory:', newCategory);

            // const response = api.post('/ambulance', {
            //     "ambulance": {
            //         "plate": newAmbulancia.plate
            //     },
            //     "category": {
            //         "description": newCategory.description,
            //         "type": newCategory.type
            //     }
            // })
            // console.log(`response:  ${response}`)
            // handleCreateDialogClose();
        }
    };

    const filteredAmbulancias = filterCategory
        ? ambulancias.filter((ambulancia) => ambulancia.category.type === filterCategory)
        : ambulancias;

    return (
        <PageContainer title="Lista Ambulancia" description="Lista de ambulancias">
            <DashboardCard title="Lista de Ambulancias">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateDialogOpen}
                    style={{ top: 0, right: 0, margin: '16px' }}
                >
                    Crear Ambulancia
                </Button>
                <Button onClick={handleShowMap} variant="contained" color="primary">
                    Mostrar Mapa
                </Button>
                {/* <Select
                    label="Filtrar por Categoría"
                    value={filterCategory}
                    onChange={handleFilterChange}
                >
                    <MenuItem value="">Todas las Categorías</MenuItem>
                    <MenuItem value={1}>Categoria 1</MenuItem>
                    <MenuItem value={2}>Categoria 2</MenuItem>
                    <MenuItem value={3}>Categoria 3</MenuItem>
                    <MenuItem value={4}>Categoria 4</MenuItem>
                </Select> */}
                <List>
                    {filteredAmbulancias.map((ambulancia) => (
                        <React.Fragment key={ambulancia.id}>
                            <ListItem>
                                <ListItemText
                                    primary={ambulancia.plate}
                                    secondary={`Categoría: ${ambulancia.category}`}
                                />
                                <Button onClick={() => handleDetailsClick(ambulancia.id)}>
                                    {expandedId === ambulancia.id ? 'Cerrar Detalles' : 'Ver Detalles'}
                                </Button>
                            </ListItem>
                            <Collapse in={expandedId === ambulancia.id} timeout="auto" unmountOnExit>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Detalles:</Typography>
                                        <Typography>Latitud: {ambulancia.latStop}</Typography>
                                        <Typography>Longitud: {ambulancia.lngStop}</Typography>
                                        {/* ... otros detalles */}
                                    </CardContent>
                                </Card>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
            </DashboardCard>
            <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
                <DialogTitle>Crear Nueva Ambulancia</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Matrícula"
                        fullWidth
                        margin="normal"
                        value={newAmbulancia.plate}
                        onChange={(e) => setNewAmbulancia({ ...newAmbulancia, plate: e.target.value })}
                    />
                    <TextField
                        label="Responsable del Vehículo"
                        fullWidth
                        margin="normal"
                        value={newAmbulancia.responsible}
                        onChange={(e) => setNewAmbulancia({ ...newAmbulancia, responsible: e.target.value })}
                    />
                    <TextField
                        label="Tipo de Servicio"
                        fullWidth
                        margin="normal"
                        value={newCategory.type}
                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                    />
                    <TextField
                        label="Descripción de funcionalidades"
                        fullWidth
                        margin="normal"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateDialogClose} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleCreateAmbulancia} color="primary">
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>
            <LoadScript googleMapsApiKey="AIzaSyAa2V392qiDYUoPyw49FgpUHGRjriPba-o">
                <Dialog open={showMap} onClose={handleCloseMap} fullWidth maxWidth="md">
                    <DialogTitle>Mapa de Ambulancias</DialogTitle>
                    <DialogContent>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={12}
                            center={center}
                            onLoad={(map) => {
                                // Guardar el centro inicial en el estado al cargar el mapa
                                setCenter(initialCenter);
                            }}
                        >
                            {ambulancias.map((ambulancia) => (
                                <Marker
                                    key={ambulancia.id}
                                    position={{ lat: ambulancia.latCurrent, lng: ambulancia.lngCurrent }}
                                    onClick={() => handleMarkerClick(ambulancia)}
                                    onCloseClick={() => handleMarkerClose(ambulancia)}
                                >
                                    {selectedAmbulance === ambulancia && (
                                        <InfoWindow onCloseClick={handleInfoWindowClose}>
                                            <div>
                                                <h2>{`Nro Placa : ${ambulancia.plate}`}</h2>
                                                {/* Agrega aquí otros detalles de la ambulancia que desees mostrar */}
                                            </div>
                                        </InfoWindow>
                                    )}
                                </Marker>
                            ))}
                        </GoogleMap>
                    </DialogContent>
                </Dialog>
            </LoadScript>
        </PageContainer>
    );
};

export default ListaAmbulancia;

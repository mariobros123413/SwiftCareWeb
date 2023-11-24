import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material'; import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useNavigate } from 'react-router-dom';

const empresas = [
  {
    id: '1',
    name: 'Empresa 1',
    address: 'Dirección 1',
    coordinates: [34.0522, -118.2437],
    nit: '123456789',
    phone: 123456789,
    email: 'empresa1@example.com',
    type: 1,
  },
  {
    id: '2',
    name: 'Empresa 2',
    address: 'Dirección 2',
    coordinates: [40.7128, -74.0060],
    nit: '987654321',
    phone: 987654321,
    email: 'empresa2@example.com',
    type: 2,
  },
  {
    id: '3',
    name: 'Empresa 3',
    address: 'Dirección 3',
    coordinates: [40.7128, -74.0060],
    nit: '987654321',
    phone: 987654321,
    email: 'empresa3@example.com',
    type: 3,
  },
  {
    id: '4',
    name: 'Empresa 4',
    address: 'Dirección 4',
    coordinates: [40.7128, -74.0060],
    nit: '987654321',
    phone: 987654321,
    email: 'empresa4@example.com',
    type: 4,
  },
  // ... más empresas
];

const ListaEmpresa = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
  const navigate = useNavigate();

  const [newEmpresa, setNewEmpresa] = useState({
    name: '',
    address: '',
    coordinates: [],
    nit: '',
    phone: 0,
    email: '',
    type: 1, // Valor por defecto, ajusta según tus necesidades
  });

  const handleDetailsClick = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setNewEmpresa({
      name: '',
      address: '',
      coordinates: [],
      nit: '',
      phone: 0,
      email: '',
      type: 1,
    });
  };

  const handleCreateEmpresa = () => {
    // Verificar si todos los campos están llenos
    if (
      !newEmpresa.name ||
      !newEmpresa.address ||
      !newEmpresa.nit ||
      !newEmpresa.phone ||
      !newEmpresa.email ||
      !newEmpresa.type
    ) {
      // Mostrar alerta si algún campo está vacío
      alert('Todos los campos deben ser llenados');
    } else {
      // Aquí puedes enviar la nueva empresa al servidor o realizar la lógica necesaria
      console.log('Nueva Empresa:', newEmpresa);
      handleCreateDialogClose();
    }
  };
  const handleViewAmbulances = (empresaId) => {
    // Aquí puedes redirigir a otro componente con el ID de la empresa
    setSelectedEmpresaId(empresaId);
    navigate(`/listaEmpresas/listaAmbulancias/${empresaId}`)
  };
  const filteredEmpresas = filterType
    ? empresas.filter((empresa) => empresa.type === filterType)
    : empresas;

  return (
    <PageContainer title="Lista Ambulancia" description="Lista de empresas de ambulancia">
      <DashboardCard title="Lista de Empresas">
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateDialogOpen}
          style={{ top: 0, right: 0, margin: '16px' }}
        >
          Crear Empresa
        </Button>
        <FormControl>
          <InputLabel id="filter-type-label">Filtrar por Tipo</InputLabel>
          <Select
            labelId="filter-type-label"
            id="filter-type"
            value={filterType}
            onChange={handleFilterChange}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={1}>Nivel 1</MenuItem>
            <MenuItem value={2}>Nivel 2</MenuItem>
            <MenuItem value={3}>Nivel 3</MenuItem>
            <MenuItem value={4}>Nivel 4</MenuItem>
          </Select>
        </FormControl>
        <List>
          {filteredEmpresas.map((empresa) => (
            <React.Fragment key={empresa.id}>
              <ListItem>
                <ListItemText
                  primary={empresa.name}
                  secondary={`${empresa.address}, ${empresa.nit}`}
                />
                <Button onClick={() => handleDetailsClick(empresa.id)}>
                  {expandedId === empresa.id ? 'Cerrar Detalles' : 'Ver Detalles'}
                </Button>
                <Button onClick={() => handleViewAmbulances(empresa.id)}>
                  Ver Ambulancias
                </Button>
              </ListItem>
              <Collapse in={expandedId === empresa.id} timeout="auto" unmountOnExit>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Detalles:</Typography>
                    <Typography>Dirección: {empresa.address}</Typography>
                    <Typography>Coordenadas: {empresa.coordinates.join(', ')}</Typography>
                    <Typography>NIT: {empresa.nit}</Typography>
                    <Typography>Teléfono: {empresa.phone}</Typography>
                    <Typography>Email: {empresa.email}</Typography>
                    <Typography>Tipo: {empresa.type}</Typography>
                  </CardContent>
                </Card>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </DashboardCard>
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>Crear Nueva Empresa</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={newEmpresa.name}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, name: e.target.value })}
          />
          <TextField
            label="Dirección"
            fullWidth
            margin="normal"
            value={newEmpresa.address}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, address: e.target.value })}
          />
          <TextField
            label="NIT"
            fullWidth
            margin="normal"
            value={newEmpresa.nit}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, nit: e.target.value })}
          />
          <TextField
            label="Teléfono"
            type="number"
            fullWidth
            margin="normal"
            value={newEmpresa.phone}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, phone: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={newEmpresa.email}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, email: e.target.value })}
          />
          <TextField
            label="Tipo"
            type="number"
            fullWidth
            margin="normal"
            value={newEmpresa.type}
            onChange={(e) => setNewEmpresa({ ...newEmpresa, type: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateEmpresa} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ListaEmpresa;
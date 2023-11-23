import React from 'react';
import { Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';


const ListaAmbulancia = () => {
  return (
    <PageContainer title="Lista Ambulancia" description="this is Sample page">

      <DashboardCard title="Lista Ambulancia">
        <Typography>This is a sample page</Typography>
      </DashboardCard>
    </PageContainer>
  );
};

export default ListaAmbulancia;

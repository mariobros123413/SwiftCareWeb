import React from 'react';
import { Typography, Bu } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';


const Reproductor = () => {
    return (
        <PageContainer title="Sample Page" description="this is Sample page">

            <DashboardCard title="Sample Page">
                <Typography>This is a sample page</Typography>
                <h1>Webhook</h1>
                <label for="videoDescription">Descripción detallada de la imágen a generar:</label>
                <div >
                    <input type="text" id="videoDescription" placeholder="Ingrese la descripción del video"></input>
                </div>
                <label for="voiceModel">Modelo de Voz:</label>
                <div >
                    <select id="voiceModel">
                        <option value="Adam">Adam</option>
                        <option value="Dorothy">Dorothy</option>
                    </select>
                </div>

                <label for="voiceNarration">Narración de Voz:</label>
                <div >
                    <input type="text" id="voiceNarration" placeholder="Ingrese la narración de voz"></input>
                </div>

                <div class="video-container" id="videoContainer" >
                </div>
                <div class="voice-container" id="voiceContainer" >
                </div>
                <button type="button">
                    Generar Video
                </button>

            </DashboardCard>
        </PageContainer >
    );
};

export default Reproductor;

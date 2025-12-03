import IPFSService from "./ipfsService";
import { config } from '../config/environment';
import { authService } from '../services/authService'
import axios from "axios";

class MinIOService {

    ipfsService: IPFSService;
    constructor() {
        this.ipfsService = new IPFSService();

    }


    private async getPresignedUrl(fileName: string): Promise<string> {
        const jwtToken = authService.getToken();
        if (!jwtToken) throw new Error('Token JWT non trovato');
        if (!config.api?.baseUrl) throw new Error('Base URL API non configurata');

        try {
            const response = await axios.get(
                `${config.api?.baseUrl}/api/v1/presigned/upload?filename=${encodeURIComponent(fileName)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Accept': 'text/plain',
                    },
                    timeout: 30000,
                }
            );

            return response.data;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Errore ottenendo presigned URL per ${fileName}:`, error.response?.data || error.message);
            } else {
                console.error(`Errore sconosciuto ottenendo presigned URL per ${fileName}:`, error);
            }
            throw error;
        }
    }

    private async uploadFile(file: File): Promise<void> {
        try {
            const presignedUrl = await this.getPresignedUrl(file.name);
            await axios.put(presignedUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
            });
            console.log(`Upload completato per: ${file.name}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Errore nella richiesta per ${file.name}:`, error.response?.data || error.message);
            } else {
                console.error(`Errore sconosciuto per ${file.name}:`, error);
            }
            throw error;
        }
    }

    public async uploadCertificationToMinio(files: File[]): Promise<void> {
        await Promise.all(files.map(file => this.uploadFile(file)));
    }
}



export default MinIOService;
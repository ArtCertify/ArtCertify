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

    private async uploadFile(
        file: File,
        onProgress?: (percent: number) => void   // <--- qui viene definito
    ): Promise<{ url: string; etag: string | undefined }> {
        const presignedUrl = await this.getPresignedUrl(file.name);

        const etag = await new Promise<string | undefined>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            });

            xhr.upload.addEventListener("error", () => {
                reject(new Error("Errore upload"));
            });

            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.getResponseHeader("ETag") || undefined);
                    } else {
                        reject(new Error(`Upload fallito: ${xhr.status}`));
                    }
                }
            };

            xhr.open("PUT", presignedUrl);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.send(file);
        });

        return { url: presignedUrl, etag };
    }
    public async uploadCertificationToMinio(files: File[], onProgress?: (progress: number) => void): Promise<void> {
        await Promise.all(
            files.map(file =>
                this.uploadFile(file, (p) => {
                    if (onProgress) onProgress(p);
                })
            )
        );
    }
}



export default MinIOService;
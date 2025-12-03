import IPFSService from "./ipfsService";
import { config } from '../config/environment';
import { authService } from '../services/authService'
import axios from "axios";

class MinIOService {

    ipfsService: IPFSService;
    constructor() {
        this.ipfsService = new IPFSService();

    }

    async uploadCertificationToMinio(files: File[]) {
        const jwtToken = authService.getToken();
        if (!jwtToken) throw new Error('Token JWT non trovato');

        await Promise.all(
            files.map(async (file) => {
                try {
                    const response = await axios.get(
                        `${config.api}/api/v1/presigned/upload?filename=${encodeURIComponent(file.name)}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${jwtToken}`,
                                'Accept': 'text/plain',
                            },
                            timeout: 30000,
                        }
                    );


                    const presignedUrl = response.data;

                    // const presignedUrl = "http://minio.caputmundi.svc.cluster.local:9000/lvf377k5dwvgloy53kc64w473s3ox74axb6osxmc3yjevhjxyl6vxyk7dy/pippo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T095504Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=e4aa678d3354cc06749d8005bbd843b7f5a6ecfccad08652d64d6efa565fa5a0";

                    // const uploadResponse = await fetch(presignedUrl, {
                    //     method: "PUT",
                    //     body: file,
                    //     headers: {
                    //         'Content-Type': file.type, 
                    //     }
                    // });

                    // if (!uploadResponse.ok) {
                    //     throw new Error(`Upload fallito: ${uploadResponse.statusText}`);
                    // }

                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error('Errore nella richiesta:', error.response?.data || error.message);
                    } else {
                        console.error('Errore sconosciuto:', error);
                    }
                    throw error;
                }
            })
        );

    }


}

export default MinIOService;
import { config } from '../config/environment';
import { authService } from '../services/authService'
import axios from "axios";


interface composedUploadResponse {
    parts: Record<number, string>;
    mergedFilename: string;
}


class MinIOService {

    private async chunkFile(file: File, chunkSizeMB = 50): Promise<File[]> {
        const chunkSize = chunkSizeMB * 1024 * 1024;
        const chunks = [];
        let start = 0;
        let index = 1;

        const lastDotIndex = file.name.lastIndexOf(".");
        const baseName = file.name.substring(0, lastDotIndex);
        const extension = file.name.substring(lastDotIndex);

        while (start < file.size) {
            const end = Math.min(start + chunkSize, file.size);
            const blobChunk = file.slice(start, end);

            const chunkFile = new File(
                [blobChunk],
                `${baseName}-${index}${extension}`,
                { type: file.type }
            );

            chunks.push(chunkFile);
            start = end;
            index++;
        }

        return chunks;
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


    private markChunkUploaded(filename: string, chunkIndex: number) {
        localStorage.setItem(`upload-${filename}-part-${chunkIndex}`, "uploaded");
    }


    private isChunkUploaded(filename: string, chunkIndex: number): boolean {
        return localStorage.getItem(`upload-${filename}-part-${chunkIndex}`) === "uploaded";
    }

    private clearUploadState(filename: string, totalChunks: number) {
        for (let i = 0; i < totalChunks; i++) {
            localStorage.removeItem(`upload-${filename}-part-${i}`);
        }
    }



    private async uploadFile(file: File, onProgress?: (percent: number) => void, signal?: AbortSignal): Promise<{ composedUploadResponse: composedUploadResponse | null }> {

        const uploadSingle = (fileToUpload: File, index?: number, chunkFilesLength?: number): Promise<{ url: string; etag: string | undefined }> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const presignedUrl = await this.getPresignedUrl(fileToUpload.name);
                    const xhr = new XMLHttpRequest();

                    // --- gestione progress ---
                    if (index !== undefined && chunkFilesLength !== undefined) {
                        xhr.upload.addEventListener("progress", (event) => {
                            if (event.lengthComputable && onProgress) {
                                const chunkProgress = event.loaded / event.total;
                                const chunkQuota = 1 / chunkFilesLength;
                                const percent = Math.round((index * chunkQuota + chunkProgress * chunkQuota) * 100);
                                onProgress(percent);
                            }
                        });
                    } else {
                        xhr.upload.addEventListener("progress", (event) => {
                            if (event.lengthComputable && onProgress) {
                                const percent = Math.round((event.loaded / event.total) * 100);
                                onProgress(percent);
                            }
                        });
                    }

                    // --- gestione abort ---
                    const onAbort = () => {
                        xhr.abort();
                        reject(new DOMException("Upload aborted", "AbortError"));
                    };
                    signal?.addEventListener("abort", onAbort);

                    // --- gestione errori ---
                    xhr.addEventListener("error", () =>  reject(new Error("Errore upload")));
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                if (index !== undefined) {
                                    const originalFilename = file.name;
                                    this.markChunkUploaded(originalFilename, index);

                                }
                                resolve({ url: presignedUrl, etag: xhr.getResponseHeader("ETag") || undefined });
                            } else {
                                reject(new Error(`Upload fallito: ${xhr.status}`));
                            }
                        }
                    };

                    xhr.open("PUT", presignedUrl);
                    xhr.setRequestHeader("Content-Type", fileToUpload.type);
                    xhr.send(fileToUpload);

                    // --- pulizia evento abort quando finisce ---
                    const cleanup = () => signal?.removeEventListener("abort", onAbort);
                    xhr.onloadend = cleanup;
                    xhr.onerror = cleanup;
                    xhr.onabort = cleanup;

                } catch (err) {
                    reject(err);
                }
            });
        };

        if (file.size > 50 * 1024 * 1024) {
            const chunkFiles = await this.chunkFile(file);

            let parts: Record<number, string> = {};
            for (let i = 0; i < chunkFiles.length; i++) {
                const chunk = chunkFiles[i];
                parts[i + 1] = chunk.name;


                if (this.isChunkUploaded(file.name, i)) {
                    continue;
                }
                await uploadSingle(chunk, i, chunkFiles.length);
            }

            return {
                composedUploadResponse: {
                    parts: parts,
                    mergedFilename: file.name
                }
            }

        } else {
            await uploadSingle(file);
            return {
                composedUploadResponse: null
            };
        }
    }


    private async composeUploadFiles(composedUploadResponse: composedUploadResponse): Promise<void> {
        const jwtToken = authService.getToken();
        if (!jwtToken) throw new Error('Token JWT non trovato');
        if (!config.api?.baseUrl) throw new Error('Base URL API non configurata');
        try {
            await axios.post(
                `${config.api?.baseUrl}/api/v1/presigned/compose`,
                {
                    mergedFilename: composedUploadResponse.mergedFilename,
                    parts: composedUploadResponse.parts
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        Accept: 'text/plain'
                    },
                    timeout: 30000
                }
            );

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Errore componendo il file:`, error.response?.data || error.message);
            } else {
                console.error(`Errore sconosciuto componendo il file:`, error);
            }
            throw error;
        }

    }

    public async uploadCertificationToMinio(files: File[], onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<void> {
        const res = await Promise.all(
            files.map(file =>
                this.uploadFile(file, (p) => {
                    if (onProgress) onProgress(p);
                }, signal)
            )
        );
        res.forEach(async r => {
            if (r.composedUploadResponse) {
                await this.composeUploadFiles(r.composedUploadResponse);

                const partsCount = Object.keys(r.composedUploadResponse.parts).length;
                this.clearUploadState(r.composedUploadResponse.mergedFilename, partsCount);
            }
        });
    }
}



export default MinIOService;
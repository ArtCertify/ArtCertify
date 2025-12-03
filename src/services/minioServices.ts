import IPFSService from "./ipfsService";
import { config } from '../config/environment';


class MinIOService {

    ipfsService: IPFSService;
    constructor() {
        this.ipfsService = new IPFSService();

    }


    async uploadCertificationToMinio(accountAddress: string | null, files: File[]) {
        const results = await Promise.all(
            files.map(async (file) => {
                // const response = await fetch(`${config.apiUrl}/api/v1/presigned/upload?filename=${encodeURIComponent(file.name)}`);

                // const resp = await fetch(
                //     "https://caputmundi.dev.ids.internal/api/v1/admin/organizations",
                //     {
                //         method: "GET",
                //         headers: {
                //             "Accept": "*/*"
                //         }
                //     }
                // );


                //           const data = await resp.ok;
                // console.log(data);


                const pippo = await fetch(`${config.api}/api/v1/admin/organizations`, {
                    method: 'GET', 
                    headers: {
                        'Content-Type': 'application/json', 
                    }
                })
                   

                const pippo2 = pippo.ok;


                // const presignedUrl = await response.text();

                // const uploadResponse = await fetch(presignedUrl, {
                //     method: "PUT",
                //     body: file,
                // });

                // const etag = uploadResponse.headers.get("etag") || uploadResponse.headers.get("ETag")

                // const result = {
                //     name: file.name,
                //     etag,
                // }

                // const fileInfo = {
                //     name: file.name,
                //     hash: result.etag!,
                //     type: file.type,
                //     size: file.size
                // };
                // const fileHashes: Array<{ name: string; hash: string; type: string; size: number }> = [];

                // fileHashes.push(fileInfo);
            })


        );



        // const metadataResult = await this.ipfsService.uploadJSON(metadata, {
        //     name: `${certificationData?.unique_id || 'metadata'}_metadata.json`,
        //     keyvalues: {
        //         asset_id: certificationData?.unique_id || '',
        //         metadata_type: 'certification',
        //         files_count: fileHashes.length.toString(),
        //         asset_name: formData.assetName || '',
        //         unit_name: formData.unitName || '',
        //         upload_timestamp: new Date().toISOString()
        //     }

        // return results;
        // }
        // );
    }
}

export default MinIOService;
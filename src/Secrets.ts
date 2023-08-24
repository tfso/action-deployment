import path from "path";
import { Fetch } from "./types";

export class Secrets {
    fetch: Fetch;
    authToken: string;
    location: URL;
    constructor(authToken:string,deploymentLocation:URL,fetchFunction:Fetch) {
        this.fetch = fetchFunction
        this.authToken = authToken;
        this.location = new URL(path.posix.join(deploymentLocation.href,'secrets'))
        
    }

    async postSecretsString(secretString: string) : Promise<void> {
        const secretAsObject = JSON.parse(secretString);
        await this.fetch(this.location.href, {
            method: "POST",
            body: JSON.stringify(secretAsObject),
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            }});   
    }

                
}
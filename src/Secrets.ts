import path from "path";
import { Fetch } from "./types";

export class Secrets {
  authToken: string;
  location: URL;
  constructor(authToken: string, deploymentLocation: URL) {
    this.authToken = authToken;
    this.location = new URL(
      path.posix.join(deploymentLocation.href, "secrets")
    );
  }

  async postSecretsString(secretString: string, fetch: Fetch): Promise<void> {
    console.log(
      `Calling endpoint ${this.location.href} with a secret : ${secretString.length} bytes`
    );
    const secretAsObject = JSON.parse(secretString);
    const result = await fetch(this.location.href, {
      method: "POST",
      body: JSON.stringify(secretAsObject),
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
    console.log(`Http result for setting secrets : ${result.status}`);
  }
}

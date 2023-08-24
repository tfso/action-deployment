import path from "path";
import fetch from "node-fetch";

export class Secrets {
  authToken: string;
  location: URL;
  constructor(authToken: string, deploymentLocation: URL) {
    this.authToken = authToken;
    this.location = new URL(
      path.posix.join(deploymentLocation.href, "secrets")
    );
  }

  async postSecretsString(secretString: string): Promise<void> {
    const secretAsObject = JSON.parse(secretString);
    await fetch(this.location.href, {
      method: "POST",
      body: JSON.stringify(secretAsObject),
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
  }
}

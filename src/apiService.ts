import { Deployment } from "./types";

const fetch = require("node-fetch");

const getEnvironment = (env: string) => {
  switch (env.toLowerCase()) {
    case "prod":
      return {
        rancherEnv: "RancherProd",
        awsBucket: "frontendfiles-prod.web.s3.24sevenoffice.com"
      };
    case "beta":
    default:
      return {
        rancherEnv: "RancherLinuxBeta",
        awsBucket: "frontendfiles-dev.web.s3.24sevenoffice.com"
      };
  }
};

export const deploy = async (authToken: string, deployment: Deployment) => {
  const { rancherEnv, awsBucket } = getEnvironment(deployment.env);
  console.log(`Deploying to Rancher env: ${rancherEnv}`);
  const response = await fetch(`${deployment.uri}/${deployment.type}`, {
    method: "POST",
    body: JSON.stringify({
      environmentVariables: {
        rancher_environment: rancherEnv,
        is_releasechannel: deployment.isReleaseChannel,
        aws_bucket: awsBucket,
        ...deployment.environmentVariables
      },
      projectName: deployment.serviceName,
      buildVersion: deployment.version,
      branchName: deployment.branch,
      containerPort: deployment.containerPort,
      httpEndpoint: deployment.httpEndpoint,
      stackName: deployment.module,
      team: deployment.team
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status === 504) {
    console.warn(
      "Rancher timed out, this is normal when there are more than 2 containers"
    );
    return;
  } else if (response.status === 200) {
    console.log("Deployment successful!");
    return;
  } else {
    console.log(response);
    throw `Deployment failed - statusCode: ${response.status} - ${response.message}`;
  }
};

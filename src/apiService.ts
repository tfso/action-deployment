import { Deployment } from "./types";

const fetch = require("node-fetch");

const getEnvironment = (env: string) => {
  switch (env.toLowerCase()) {
    case "prod":
      return {
        rancherEnv: "RancherProd",
        awsBucket: "frontendfiles-prod.web.s3.24sevenoffice.com"
      };
    case "test":
      return {
        rancherEnv: "RancherLinuxTest",
        awsBucket: "frontendfiles-test.web.s3.24sevenoffice.com"
      };
    case "beta":
    default:
      return {
        rancherEnv: "RancherLinuxBeta",
        awsBucket: "frontendfiles-dev.web.s3.24sevenoffice.com"
      };
  }
};

export const checkStatus = async (authToken:string, location: string) => {
  const response = await fetch(location, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    }});
    
    if (response.status>=200 && response.status<=299) {
      const resJson = await response.json();
      return resJson.status;
    }
    else {
      throw "Deployment not found!";
    }

}

export const deploy = async (authToken: string, deployment: Deployment) => {
  const { rancherEnv, awsBucket } = getEnvironment(deployment.env);
  console.log(`Deploying to Rancher env: ${rancherEnv}`);
  const params = JSON.stringify({
    environmentVariables: {
      rancher_environment: rancherEnv,
      is_releasechannel: deployment.isReleaseChannel,
      aws_bucket: awsBucket,
      ...deployment.environmentVariables
    },
    environment: deployment.env,
    projectName: deployment.serviceName,
    buildVersion: deployment.version,
    branchName: deployment.branch,
    containerPort: deployment.containerPort,
    httpEndpoint: deployment.httpEndpoint,
    stackName: deployment.module,
    team: deployment.team,
    dd_service: deployment.dd_service,
    readinessProbe: deployment.readinessProbe,
    livenessProbe: deployment.livenessProbe,
    instances: deployment.instances,
    imageName: deployment.imageName,
    deployerName: deployment.deployerName
  },null,2);  
  console.log("POST BODY",params);
  const response = await fetch(`${deployment.uri}/${deployment.type}`, {
    method: "POST",
    body: params,
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
  } else if (response.status >= 200 && response.status<=299) {
    console.log("Deployment successful!");
    console.log("Headers returned : ",response.headers);
    console.log("Status was", response.headers);

    return response.headers.get('location');
  } else {
    const responseText = await response.text();
    console.log(`Data sent was : ${JSON.stringify(params)}`);
    throw `Deployment failed - statusCode: ${response.status} - ${responseText}`;
  }
};

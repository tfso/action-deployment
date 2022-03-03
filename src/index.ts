import core = require("@actions/core")
import { context } from "@actions/github";
import { deploy } from "./apiService";

const getDeploymentType = (type: string): string => {
  switch (type) {
    case "website":
      return "v2/staticsite";
    case "rancher2":
      return "container-upgradev3";  
    case "api":
    default:
      return "container-upgrade";
    
  }
};

const run = async () => {
  const token = core.getInput("deployment_token");
  const env = core.getInput("environment");
  const serviceName = core.getInput("service_name");
  const branch = context.ref.replace("refs/heads/", "") || context.ref.replace("refs/tags/", "");
  const deploymentUri =
    process.env.DEPLOYMENT_URI || "https://deployment.api.24sevenoffice.com";
  const version =
    core.getInput("version") || context.ref.replace("refs/tags/", "");
  const type = getDeploymentType(core.getInput("type"));
  const isReleaseChannel = core.getBooleanInput('release-channel')
  const envVariables = Object.keys(process.env || {}).filter(x=>x.indexOf("TFSO_")==0).reduce((prev:{[name:string]:string},cur:string)=>{ prev[cur.replace('TFSO_','')] = process.env[cur]; return prev } ,{})
  const containerPortString = core.getInput('containerPort');
  const httpEndpoint = core.getInput('httpEndpoint');
  let containerPort : number|undefined = undefined;
  if (containerPortString) containerPort = parseInt(containerPortString)
  await deploy(token, {
    env,
    serviceName,
    version,
    type,
    uri: deploymentUri,
    isReleaseChannel: isReleaseChannel ?? false,
    branch,
    environmentVariables: envVariables,
    containerPort: containerPort,
    httpEndpoint: httpEndpoint,
    module: core.getInput('module'),
    team: core.getInput('team')
  });
};

run();

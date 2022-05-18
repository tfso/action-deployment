import core = require("@actions/core");
import { context } from "@actions/github";
import { deploy, checkStatus} from "./apiService";

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

const sleep = (ms:number) =>
  new Promise(resolve => setTimeout(resolve, ms));


const run = async () => {
  const token = core.getInput("deployment_token");
  const env = core.getInput("environment");
  const serviceName = core.getInput("service_name");
  const imageName = core.getInput("image_name");
  const version =
    core.getInput("version") || context.ref.replace("refs/tags/", "");
  const type = getDeploymentType(core.getInput("type"));
  console.log("Type ",type);
  const isReleaseChannel = core.getBooleanInput('release-channel')
  const envVariables = Object.keys(process.env || {}).filter(x=>x.indexOf("TFSO_")==0).reduce((prev:{[name:string]:string},cur:string)=>{ prev[cur.replace('TFSO_','')] = process.env[cur]; return prev } ,{})
  const containerPortString = core.getInput('container-port');
  const httpEndpoint = core.getInput('http-endpoint');
  const readyTestPath = core.getInput('readytest-path')
  const healthTestPath = core.getInput('healthtest-path')
  const branch =
    context.ref.replace("refs/heads/", "") ||
    context.ref.replace("refs/tags/", "");
  const deploymentUri =
    process.env.DEPLOYMENT_URI || "https://deployment.api.24sevenoffice.com";
  console.log("Using url ",deploymentUri);

  let containerPort : number|undefined = undefined;
  if (containerPortString) containerPort = parseInt(containerPortString)
  const deployParams = {
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
    team: core.getInput('team'),
    readyTestPath: readyTestPath,
    healthTestPath: healthTestPath,
    dd_service: core.getInput('dd-service'),
    instances: parseInt(core.getInput('instances')),
    imageName

  };
  console.log(JSON.stringify(deployParams));
  var location = await deploy(token, deployParams);
  if (!location) {
    console.log("No location returned.  Assume the deployment is ok!");
    return;
  }
  console.log("Checking location ",location," for latest status on deployment");
  for (var x=0;x<15;x++) {
    console.log("Waiting ",x,"seconds - and then testing status");
    await sleep((x+1)*1000);
    const status = await checkStatus(token,location);
    console.log("Status is ",status);
    if (status=="active") {
      console.log("Deployment is ACTIVE!")
      return;
    }
  }

};

run();

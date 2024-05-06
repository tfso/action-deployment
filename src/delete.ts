import core = require("@actions/core");
import {deleteDeployment} from "./apiService";
import { getDeploymentUri } from "./utils";

const run = async () => {
    console.log("Running rancher2 deployment");
    const token = core.getInput("deployment_token");
    const env = core.getInput("environment");
    const serviceName = core.getInput("service_name");
    const module = core.getInput('module');
    const httpResource = "container-upgradev3";
    
    const deploymentUri = getDeploymentUri(env)
    console.log("Using url ",deploymentUri);
  

    try {
      console.log(`💀 Deleting service ${serviceName} in namespace ${env}-${module}`)
      await deleteDeployment(token, deploymentUri, httpResource, env, module, serviceName)
      console.log('🎉 Deletion successfull!')
    } catch (error) {
      core.setFailed(error.message)
    }
  };
  
  run();
  
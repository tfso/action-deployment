import core = require("@actions/core");
import {deleteDeployment} from "./apiService";

const run = async () => {
    console.log("Running rancher2 deployment");
    const token = core.getInput("deployment_token");
    const env = core.getInput("environment");
    const serviceName = core.getInput("service_name");
    const module = core.getInput('module');
    const httpResource = "container-upgradev3";
    
    const deploymentUri =
      process.env.DEPLOYMENT_URI || "https://deployment.api.24sevenoffice.com";
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
  
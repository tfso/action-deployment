import core = require("@actions/core")
import { context } from "@actions/github";
import { deploy } from "./apiService";

const getDeploymentType = (type: string): string => {
  switch (type) {
    case "website":
      return "v2/staticsite";
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

  await deploy(token, {
    env,
    serviceName,
    version,
    type,
    uri: deploymentUri,
    isReleaseChannel: isReleaseChannel ?? false,
    branch
  });
};

run();

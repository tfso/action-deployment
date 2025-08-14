import core = require("@actions/core");
import { context } from "@actions/github";
import { deploy, checkStatus } from "./apiService";
import { ProbeConfig, VolumeConfig, VolumeMountConfig } from "./types";
import { getDeploymentUri } from "./utils";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getProbeConfiguration = (core: any, probeType: string): ProbeConfig => {
  const period = core.getInput(`${probeType}-period`);
  const initialdelay = core.getInput(`${probeType}-initialdelay`);
  const timeout = core.getInput(`${probeType}-timeout`);

  const path = core.getInput(`${probeType}-path`) || undefined;
  const command = core.getInput(`${probeType}-command`)
    ? [core.getInput(`${probeType}-command`)]
    : undefined;
  if (!path && !command) {
    return undefined;
  }

  return {
    path,
    command,
    periodSeconds: period ? parseInt(period) : undefined,
    initialDelaySeconds: initialdelay ? parseInt(initialdelay) : undefined,
    timeoutSeconds: timeout ? parseInt(timeout) : undefined,
  };
};

const getVolumeConfig = (
  volumesInput: any[],
  volumeType: string
): VolumeConfig[] => {
  return volumesInput
    .map((v) => JSON.parse(v))
    .map(
      (v) =>
      ({
        name: v.name,
        volume: {
          readOnly: v.readOnly,
          volumeType: volumeType,
          claimName: v.claimName,
        },
      } as VolumeConfig)
    );
};

function getWorkflowFileName(): string {
  const ref = process.env.GITHUB_WORKFLOW_REF;
  if (ref) {
    const m = ref.match(/\/\.github\/workflows\/([^@]+)@/);
    if (m && m[1]) return m[1];
  }
  return process.env.GITHUB_WORKFLOW || context.workflow || "unknown";
}

function ensureTfsoEnv(envVars: Record<string, string>, repository: string) {
  const owner = context.repo.owner;
  const tfsoRepo = `${owner}/${repository}`;

  if (envVars.TFSO_REPOSITORY === undefined) {
    envVars.TFSO_REPOSITORY = tfsoRepo;
  }
  if (envVars.TFSO_WORKFLOW === undefined) {
    envVars.TFSO_WORKFLOW = getWorkflowFileName();
  }
}

const run = async () => {
  console.log("Running rancher2 deployment");
  const token = core.getInput("deployment_token");
  const env = core.getInput("environment");
  const serviceName = core.getInput("service_name");
  const imageName = core.getInput("image_name");
  const deployerName = context.actor;
  const version =
    core.getInput("version") || context.ref.replace("refs/tags/", "");
  const type = getDeploymentType(core.getInput("type"));
  console.log("Type ", type);
  const isReleaseChannel = core.getBooleanInput("release-channel");
  const envVariables = getEnvironmentVariables(process.env);
  const containerPortString = core.getInput("container-port");
  const httpEndpoint = core.getInput("http-endpoint") || undefined;
  const repository = core.getInput("repository") || context.repo.repo;
  ensureTfsoEnv(envVariables, repository);

  const proxyBufferSize = core.getInput("proxy-buffer-size");
  const proxyBodySize = core.getInput("proxy-body-size");
  const readinessProbe = getProbeConfiguration(core, "readytest");
  const livenessProbe = getProbeConfiguration(core, "healthtest");
  const allowedOrigins = core.getInput("cors-allowed-origins") ?? undefined;
  const volumes = getVolumeConfig(
    core.getMultilineInput("persistent-volumes"),
    "persistentVolumeClaim"
  );
  const volumeMounts = core
    .getMultilineInput("volume-mounts")
    .map((v) => JSON.parse(v) as VolumeMountConfig);
  const resources = getResourceSettings(core);
  const branch =
    context.ref.replace("refs/heads/", "") ||
    context.ref.replace("refs/tags/", "");
  const deploymentUri = getDeploymentUri(env);
  console.log("Using url ", deploymentUri);
  const secrets = {
    ...JSON.parse(core.getInput("secrets_string") || "{}"),
    ...getSecretEnvironmentVariables(process.env),
  };

  let containerPort: number | undefined = undefined;
  if (containerPortString) containerPort = parseInt(containerPortString);
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
    module: core.getInput("module"),
    team: core.getInput("team"),
    readinessProbe,
    livenessProbe,
    volumes,
    volumeMounts,
    dd_service: core.getInput("dd-service"),
    instances: parseInt(core.getInput("instances")),
    imageName,
    deployerName: deployerName,
    proxyBufferSize,
    proxyBodySize:
      proxyBodySize && proxyBodySize.length > 0 ? proxyBodySize : undefined,
    resources,
    corsSettings: {
      allowedOrigins,
    },
    repository
  };
  console.log(JSON.stringify(deployParams));

  try {
    const location = await deploy(token, { ...deployParams, secrets });
    await waitForDeploymentToComplete(location, token);
  } catch (error) {
    core.setFailed(error);
  }
};

async function waitForDeploymentToComplete(
  location: string,
  token: string
): Promise<void> {
  core.setOutput("deploymenturl", location);
  if (!location) {
    console.log("No location returned.  Assume the deployment is ok!");
    return;
  }

  console.log(
    "Checking location ",
    location,
    " for latest status on deployment"
  );
  for (var x = 0; x < 20; x++) {
    console.log("Waiting ", x, "seconds - and then testing status");
    await sleep((x + 1) * 1000);
    const status = await checkStatus(token, location);
    console.log("Status is ", status);
    if (status == "active") {
      console.log("Deployment is ACTIVE!");
      return;
    }
  }
  throw "Error : Deployment was not set to active within set period.";
}

function getResourceSettings(c: typeof core) {
  return {
    requests: {
      memoryMib: parseInt(c.getInput("memory-reservation") || "128"),
      mCpu: parseInt(c.getInput("cpu-reservation") || "50"),
    },
    limits: {
      memoryMib: parseInt(c.getInput("memory-limit") || "512"),
      mCpu: parseInt(c.getInput("cpu-limit") || "1000"),
    },
  };
}

function getSecretEnvironmentVariables(env: Record<string, string>) {
  return Object.keys(env || {})
    .filter((x) => x.indexOf("TFSO_SECRET_") == 0)
    .reduce((prev: { [name: string]: string }, cur: string) => {
      prev[cur.replace("TFSO_SECRET_", "")] = env[cur];
      return prev;
    }, {});
}

function getEnvironmentVariables(env: Record<string, string>) {
  return Object.keys(env || {})
    .filter((x) => x.startsWith("TFSO_") && !x.startsWith("TFSO_SECRET_"))
    .reduce((prev: { [name: string]: string }, cur: string) => {
      prev[cur.replace("TFSO_", "")] = env[cur];
      return prev;
    }, {});
}

run();

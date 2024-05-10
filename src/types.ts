import { RequestInfo, RequestInit } from "node-fetch";

export type ProbeConfig = {
  path?: string;
  periodSeconds?: number;
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  command?: string[];
};

export type PersistentVolumeClaimConfig = {
  volumeType: "persistentVolumeClaim";
  readOnly: boolean;
  claimName: string;
};

export type VolumeConfig = {
  name: string;
  volume: PersistentVolumeClaimConfig;
};

export type VolumeMountConfig = {
  readOnly: boolean;
  path: string;
  subPath?: string;
  name: string;
};

export type Resources = {
  requests: {
    memoryMib: number;
    mCpu: number;
  };
  limits: {
    memoryMib: number;
    mCpu: number;
  };
};

export type Deployment = {
  env: string;
  serviceName: string;
  version: string;
  type: string;
  uri: string;
  isReleaseChannel: boolean;
  branch?: string;
  imageName?: string;
  instances: number;
  readinessProbe?: ProbeConfig;
  livenessProbe?: ProbeConfig;
  volumes: VolumeConfig[];
  volumeMounts: VolumeMountConfig[];
  dd_service: string;
  team: string;
  module: string;
  httpEndpoint: string;
  containerPort: number;
  environmentVariables: { [name: string]: string };
  secrets: { [name: string]: string };
  deployerName: string;
  proxyBufferSize: string;
  proxyBodySize: string;
  resources: Resources;
};

export type FetchResponse = { json: () => Promise<any>; status: number };
export type Fetch = (
  url: RequestInfo,
  init?: RequestInit
) => Promise<FetchResponse>;

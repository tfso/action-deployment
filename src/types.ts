export type ProbeConfig = {
    path?: string
    periodSeconds?: number
    initialDelaySeconds?: number
    timeoutSeconds?: number
    command?: string[]
}

export type PersistentVolumeClaimConfig = {
    volumeType: 'persistentVolumeClaim'
    readOnly: boolean
    claimName: string
}

export type VolumeConfig = {
    name: string
    volume: PersistentVolumeClaimConfig
}

export type VolumeMountConfig = {
    readOnly: boolean
    path: string
    subPath?: string
    name: string
}


export type Deployment = {
    env: string
    serviceName: string
    version: string
    type: string
    uri: string
    isReleaseChannel: boolean
    branch?: string
    imageName?: string,
    instances: number
    readinessProbe: ProbeConfig,
    livenessProbe: ProbeConfig,
    volumes: VolumeConfig[]
    volumeMounts: ContainerVolumeMountConfig[]
    dd_service: string
    team: string
    module: string
    httpEndpoint: string
    containerPort: number
    environmentVariables: {[name:string]:string}
    deployerName: string
}
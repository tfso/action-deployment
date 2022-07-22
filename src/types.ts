export type ProbeConfig = {
    path?: string
    periodSeconds?: number
    initialDelaySeconds?: number
    timeoutSeconds?: number
    command?: string[]
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
    dd_service: string
    team: string
    module: string
    httpEndpoint: string
    containerPort: number
    environmentVariables: {[name:string]:string}
    deployerName: string
}
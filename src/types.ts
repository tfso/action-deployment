export type Deployment = {
    env: string
    serviceName: string
    version: string
    type: string
    uri: string
    isReleaseChannel: boolean
    branch?: string
    environmentVariables: {[name:string]:string}
    containerPort?: number
    httpEndpoint?: string
    module: string,
    team: string
    dd_service: string
    readyTestPath: string
    healthTestPath: string
}
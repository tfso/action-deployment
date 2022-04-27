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
    healthTestPath: string
    readyTestPath: string
    dd_service: string
    team: string
    module: string
    httpEndpoint: string
    containerPort: number
    environmentVariables: {[name:string]:string}
}
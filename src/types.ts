export type Deployment = {
    env: string
    serviceName: string
    version: string
    type: string
    uri: string
    isReleaseChannel: boolean
    branch?: string
}
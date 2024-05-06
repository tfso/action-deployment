export const getDeploymentUri = (env: string) => {
    switch (env.toLowerCase()) {
        case 'beta':
            return "https://deployment-beta.api.24sevenoffice.com"
        case 'prod':
            return "https://deployment.api.24sevenoffice.com"
        default:
            return process.env.DEPLOYMENT_URI || "https://deployment.api.24sevenoffice.com"
    }
}
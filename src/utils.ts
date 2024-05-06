export const getDeploymentUri = (env: string) => {
    if (process.env.DEPLOYMENT_URI) {
        return process.env.DEPLOYMENT_URI
    }

    if (env.toLowerCase() === 'beta') {
        return "https://deployment-beta.api.24sevenoffice.com"
    }
    return "https://deployment.api.24sevenoffice.com"
}
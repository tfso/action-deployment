# Deployment Action

This GitHub Action can be used to deploy APIs and static websites into TFSO. It currently supports deploying to Rancher1, Rancher2 and deploying static files to S3.

## Local development

Developing GH Actions locally used to be an absolute pain, since we had to commit - then test - for every change, often testing in a completely different repository.

Some very nice people have created a way to test GH Actions locally, called [act](https://github.com/nektos/act). Do yourself a huge favor and download the `act` CLI _now_!

### How to develop locally

1. Download [act](https://github.com/nektos/act)
2. Comment out the `dist` line in the [.gitignore](./.gitignore) file. (annoying I know, but `act` does not find dist if it is in `.gitignore`)
3. Ensure you have cloned and setup `tfso/deploymentapi` locally.
4. Find a repository that has already run a deployment job using `tfso/action-deployment`. Find the step that deploys, expand the **Run tfso/action-deployment@v1** and copy its content.
5. Create your own action using the content - you can create a file called `my_test.yml` under `.github/workflows`. The file is ignored by git, so have as much fun as you want here.
    - If you point to secrets in the workflow file, you can create a file called `.env-test-secrets` (also ignored). And tell `act` to look for the secrets file.

In the end you might have a YAML file looking something like this:

*.github/workflows/my_test.yml*
```yml
name: My test

on: push

env:
jobs:
  my-deployment:
    runs-on: ubuntu-latest
    steps:
      # MUST HAVE
      - name: Checkout
        uses: actions/checkout@v2
        with:
          path: 'deployment-action'

      # MUST HAVE
      - name: Checkout Github
        uses: actions/checkout@v2
        
      - uses: ./
        name: deploy
        with:
          type: rancher2
          service_name:  tfso.api.example
          image_name: tfso/example-api
          version: v0.0.1
          dd-service: example.24sevenoffice.com
          team: "aws"
          module: "deployment"
          deployment_token: ${{ secrets.DEPLOYMENT_API_TOKEN }}
          environment: beta
          instances: 1
          container-port: 80
          http-endpoint: example.api2.24sevenoffice.com
          healthtest-path: /healthz
          readytest-path: /healthz
        env:
          DEPLOYMENT_URI: https://localhost:3000 # Point to locally running instance of deploymentapi
          NODE_TLS_REJECT_UNAUTHORIZED: 0 # This is needed when calling local deploymentapi, since it uses a self-signed cert
```

*.env-test-secrets*
```
DEPLOYMENT_API_TOKEN=secret_token
```

Not that you must have the first two checkout steps, you also need to set `DEPLOYMENT_URI` and  `NODE_TLS_REJECT_UNAUTHORIZED: 0` if you want to work against a locally running deploymentapi.

The last step:

```sh
# Remove `--secret-file .env-test-secrets` if no secrets
# my-deployment is the name of the job you want to run
act -j my-deployment --secret-file .env-test-secrets
```

If you get an error with the code `MODULE_NOT_FOUND`, you have probably forgot to comment out `dist` in `.gitignore`.
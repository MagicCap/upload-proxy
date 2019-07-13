![Docker Pulls](https://img.shields.io/docker/pulls/jakemakesstuff/magiccap-upload-proxy.svg)

# MagicCap Upload Proxy
The MagicCap upload proxy. Used to allow iOS/Android to upload using the MagicCap app, and in the desktop client as an optional item for protection. The proxy uses an Express core with all of the uploaders from the MagicCap codebase. There are several ways to deploy the proxy:

## Deploying via Docker
If you are deploying via Docker, simply pull `jakemakesstuff/magiccap-upload-proxy`. The application runs on port 8080, so make sure your reverse proxy can point to that on your Docker container. To set a proxy username and password, simply set the environment variables `MAGICCAP_USERNAME` and `MAGICCAP_PASSWORD`. To update, simply pull the newest Docker release.

## Deploying via Kubernetes
**This tutorial assumes you have Cert Manager and an nginx ingress controller. If not, you are on your own with setting it up on Kubernetes.**

If you are deploying via Kubernetes and fit the above requirements, you can simply go into the k8s folder and deploy each file after editing any references of `proxy.magiccap.me` to your hostname. Once again, if you want a proxy username/password, simply un-comment the username/password bits in `statefulset.yaml`. To update the deployment, simply run `kubectl rollout restart statefulset/magiccap-upload-proxy` with kubectl 1.15 or above.

## Deploying to a system with the Node files (Not suggested)
To just deploy the Node files to a host and then deal with all of the configuration yourself, simply run `get_uploaders.sh` on the system you want to deploy to (using Git Bash if on Windows). From here, you can run `node .` once you have ran `npm i` (assuming you have Node 10/12 installed). Note you are on your own with this configuration. By default, this will run on `127.0.0.1`. You can change this with the `MAGICCAP_HOST` variable.

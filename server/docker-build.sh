#!/bin/bash
#
# sudo apt-get install jq 

NPM_TOKEN=$(cat ~/.github.token)
PACKAGE_VERSION=$(jq -r ".version" package.json)

npm run build

docker build --build-arg NPM_TOKEN=${NPM_TOKEN} -t cbr-server:${PACKAGE_VERSION} .
docker tag cbr-server:${PACKAGE_VERSION} docker.pkg.github.com/hilfestellung/cbr-server/cbr-server:${PACKAGE_VERSION}
docker push docker.pkg.github.com/hilfestellung/cbr-server/cbr-server:${PACKAGE_VERSION}

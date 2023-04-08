#!/bin/bash

envsubst < deployment/deployment.yaml > ./new_deployment.yaml
envsubst < deployment/service.yaml > ./new_service.yaml


#!/usr/bin/env bash
docker run --env-file .env -p 9990:80 --rm dariusbakunas/homeportal-api:latest

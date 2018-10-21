#!/usr/bin/env bash
docker run --env-file .env -p 8080:8080 --rm dariusbakunas/homeportal-api:latest

.PHONY: dev build lint format typecheck test test-client test-server test-e2e test-all generate-api

dev:
	@trap 'kill 0' EXIT; \
	cd server && npm run dev & \
	cd client && npm run dev & \
	wait

build:
	npm run build --prefix client

lint:
	npm run lint --prefix client

format:
	npm run format --prefix client

typecheck:
	npm run typecheck --prefix client

test: test-client test-server

test-client:
	npm run test --prefix client

test-server:
	npm run test --prefix server

test-e2e:
	npm run test:e2e --prefix client

test-all: test test-e2e

generate-api:
	npx openapi-typescript server/openapi.json -o client/src/api/generated/schema.d.ts

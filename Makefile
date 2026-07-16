.PHONY: dev build lint format typecheck test generate-api

dev:
	npm run dev --prefix client

build:
	npm run build --prefix client

lint:
	npm run lint --prefix client

format:
	npm run format --prefix client

typecheck:
	npm run typecheck --prefix client

test:
	npm run test --prefix client

generate-api:
	npx openapi-typescript server/openapi.json -o client/src/api/generated/schema.d.ts

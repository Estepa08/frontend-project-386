.PHONY: dev build lint format typecheck test

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

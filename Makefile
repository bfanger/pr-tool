dev:
	yarn --cwd ./web concurrently --kill-others 'yarn dev' 'yarn --cwd ../electron dev'
	
build:
	yarn --cwd ./web build
	yarn --cwd ./electron build

lint:
	yarn --cwd ./web concurrently --kill-others 'yarn lint' 'yarn --cwd ../electron lint'

format:
	yarn --cwd ./web concurrently --kill-others 'yarn format' 'yarn --cwd ../electron format'
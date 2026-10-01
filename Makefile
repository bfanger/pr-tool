setup:
	pnpm --prefix ./web install
	npm --prefix ./electron install

dev:
	pnpm --prefix ./web concurrently --kill-others 'pnpm dev' 'pnpm --prefix ../electron dev'
	
build:
	pnpm --prefix ./web build
	pnpm --prefix ./electron build

lint:
	pnpm --prefix ./web concurrently --kill-others 'pnpm lint' 'pnpm --prefix ../electron lint'

format:
	pnpm --prefix ./web concurrently --kill-others 'pnpm format' 'pnpm --prefix ../electron format'
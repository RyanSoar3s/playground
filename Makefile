.PHONY: all docker backend frontend clean

DIST=dist

all: docker backend frontend clean

docker:
	@echo "[DOCKER]: Building images..."
	bun run build:docker

backend:
	@echo "[Backend]: Building server..."
	mkdir -p $(DIST)/backend
	bun run build:backend
	cp -r backend/dist/* $(DIST)/backend/

frontend:
	@echo "[Frontend]: Building client..."
	mkdir -p $(DIST)/frontend
	bun run build:frontend
	cp -r frontend/dist/* $(DIST)/frontend/

clean:
	cd backend && rm -rf $(DIST)
	cd frontend && rm -rf $(DIST)
	rm -rf $(DIST)

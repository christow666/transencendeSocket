# make 						-> Basic Execution

# make build & make rund  	-> Daemon Execution

# make clean				-> Clean ALL the shits

# make reset				-> Clean ALL the shits and make

# -------------- Build --------------

all: build run

build:
	@docker-compose build


# Interactive
run:
	@docker-compose up

# As Daemon
rund:
	@docker-compose up -d


# -------------- Stop --------------
stop:
	@docker-compose stop





# -------------- Enter in Docker --------------
cache:
	@docker-compose exec cache sh

daphne:
	@docker-compose exec daphne sh

nginx:
	@docker-compose exec nginx sh





# --------------- Clean up -----------------

clean: stop
	@docker-compose down || true
	@docker-compose down --volumes --rmi all --remove-orphans --timeout 0 || true


# ---------------- Status -----------------
check:
	@echo "_____________________________________\n"
	@docker ps -a
	@echo "_____________________________________\n"
	@docker images
	@echo "_____________________________________\n"



# --------------- Log -----------------
logs:
	@docker-compose logs


# Reset everything
reset: clean all
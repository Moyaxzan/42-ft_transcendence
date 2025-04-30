GREEN := \e[92m
GRAY := \e[90m
#PINK := \e[38;2;255;105;180m
PINK := \e[38;5;212m
BLUE := \e[94m
RESET := \e[0m

NAME = transcendence

all:
	@echo "$(GRAY)Creating /srcs/requirements/transcendence_db.sqlite$(RESET)"
	@touch ./srcs/requirements/sqlite/transcendence_db.sqlite
	@echo "$(BLUE)/srcs/requirements/transcendence_db.sqlite$(RESET) created: $(GREEN)Success$(RESET)"
	@echo  "$(GRAY)Copying HOME/.env into /srcs$(RESET)"
	@cp $(HOME)/.env srcs/.env
	@echo "$(BLUE)HOME/.env$(RESET) copied into /srcs: $(GREEN)Success$(RESET)\n"
	@echo "$(GRAY)Copying HOME/secrets into /srcs/requirements/nginx/secrets$(RESET)"
	@cp -r $(HOME)/secrets ./srcs/requirements/nginx/secrets
	@echo "$(BLUE)HOME/secrets$(RESET) copied into /srcs/requirements/nginx/secrets: $(GREEN)Success$(RESET)"
	@echo "\n$(PINK)$(NAME) ready!$(RESET)"
	docker compose -f ./srcs/docker-compose.yml up --build

clean:
	@docker images
	@echo ""
	@docker ps -a
	@echo ""
#	@docker volume ls
#	@echo ""
#	@docker network ls
#	@echo ""
	@echo  "$(BLUE)Removing containers$(RESET)"
	@docker stop $$(docker ps -qa) || true
	@docker rm $$(docker ps -qa) || true
	@docker rmi -f $$(docker images -qa) || true
#	@rm	./srcs/requirements/sqlite/transcendence_db.sqlite
	@rm -rf ./srcs/.env ./srcs/requirements/nginx/secrets
	@echo "$(BLUE)srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo "$(BLUE)srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
	@docker images
	@echo ""
	@docker ps -a
	@echo ""
#	@docker volume ls
#	@echo ""
#	@docker network ls
	@echo "Containers removed $(GREEN)successfully$(RESET)"

down:
	@docker compose -f ./srcs/docker-compose.yml stop
	@echo -e "Containers stopped $(GREEN)successfully$(RESET)"

up:
	@echo -e "$(BLUE)Restarting Containers$(RESET)"
	@docker compose -f ./srcs/docker-compose.yml up

fclean: clean
	@docker system prune -af

GREEN := \e[92m
GRAY := \e[90m
#PINK := \e[38;2;255;105;180m
PINK := \e[38;5;212m
BLUE := \e[94m
RESET := \e[0m

NAME = transcendence
REQUIREMENTS = ./srcs/requirements
DB_DATA = ./data/database
NGINX_DATA = ./data/nginx

all:
	@echo  "$(GRAY)Copying HOME/.env into ./srcs$(RESET)"
	@cp $(HOME)/.env srcs/.env
	@echo "$(BLUE)HOME/.env$(RESET) copied into ./srcs: $(GREEN)Success$(RESET)\n"
	@echo "$(GRAY)Copying HOME/secrets into $(REQUIREMENTS)/nginx/secrets$(RESET)"
	@cp -r $(HOME)/secrets $(REQUIREMENTS)/nginx/secrets
	@echo "$(BLUE)HOME/secrets$(RESET) copied into $(REQUIREMENTS)/nginx/secrets: $(GREEN)Success$(RESET)"
	@echo "\n$(GRAY)Creating repositories for persistent data$(RESET)"
	@mkdir -p $(DB_DATA) $(NGINX_DATA)
	@echo "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
	@echo "\n$(PINK)$(NAME) ready!$(RESET)"
	@tsc
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
#	@rm	$(REQUIREMENTS)/sqlite/transcendence_db.sqlite
	@rm -rf ./srcs/.env $(REQUIREMENTS)/nginx/secrets $(DB_DATA) $(NGINX_DATA)
	@echo "$(BLUE)srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo "$(BLUE)srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
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

GREEN := \e[92m
GRAY := \e[90m
#PINK := \e[38;2;255;105;180m
PINK := \e[38;5;212m
BLUE := \e[94m
RESET := \e[0m

NAME = transcendence
REQUIREMENTS = ./srcs/requirements
DB_DATA = ./data/database
DB_DOCKER = $(REQUIREMENTS)/database/data
NGINX_DATA = ./data/modsec_logs
VAULT_CERT_DIR = $(REQUIREMENTS)/hashicorp-vault

all: 
	@echo -e  "$(GRAY)Copying HOME/.env into ./srcs$(RESET)"
	@cp $(HOME)/.env srcs/.env
	@echo -e "$(BLUE)HOME/.env$(RESET) copied into ./srcs: $(GREEN)Success$(RESET)\n"
	@echo -e "$(GRAY)Copying HOME/secrets into $(REQUIREMENTS)/nginx/secrets$(RESET)"
	@cp -r $(HOME)/secrets $(REQUIREMENTS)/nginx/secrets
	@echo -e "$(BLUE)HOME/secrets$(RESET) copied into $(REQUIREMENTS)/nginx/secrets: $(GREEN)Success$(RESET)"
	@echo -e  "\n$(GRAY)Copying HOME/certs into $(VAULT_CERT_DIR)/certs$(RESET)"
	@cp -r $(HOME)/certs/* $(VAULT_CERT_DIR)/certs
	@echo -e "$(BLUE)HOME/certs$(RESET) copied into $(VAULT_CERT_DIR)/certs: $(GREEN)Success$(RESET)"
	@echo -e "\n$(GRAY)Creating repositories for persistent data$(RESET)"
	@mkdir -p $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER)
	@ echo -e "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
	@export VAULT_ADDR='https://127.0.0.1:8200'
	@echo -e "\n$(PINK)$(NAME) ready!$(RESET)"
	@tsc
	@docker compose -f ./srcs/docker-compose.yml -f ./srcs/docker-compose-devops.yml up --build


clean:
	@docker images
	@ echo -e ""
	@docker ps -a
	@ echo -e ""
	@docker volume ls
	@ echo -e ""
	@docker network ls
	@ echo -e ""
	@ echo -e  "$(BLUE)Removing containers$(RESET)"
	@docker stop $$(docker ps -qa) || true
	@docker rm $$(docker ps -qa) || true
	@docker rmi -f $$(docker images -qa) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm $(NAME) || true
	@rm -rf ./srcs/.env $(REQUIREMENTS)/nginx/secrets $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER) $(VAULT_CERT_DIR)/certs
	@ echo -e "$(BLUE)./srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)./srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)$(VAULT_CERT_DIR)/*$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
	@rm -rf ./srcs/.env $(REQUIREMENTS)/nginx/secrets $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER) $(VAULT_CERT_DIR)/certs
	@ echo -e "$(BLUE)./srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)./srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)$(VAULT_CERT_DIR)/certs$(RESET) removed: $(GREEN)Success$(RESET)"
	@ echo -e "$(BLUE)Repositories for persistent data$(RESET) removed: $(GREEN)Success$(RESET)\n"
	@docker images
	@ echo -e ""
	@docker ps -a
	@ echo -e ""
	@docker volume ls
	@ echo -e ""
	@docker network ls
	@ echo -e "Containers removed $(GREEN)successfully$(RESET)"

down:
	@docker compose -f ./srcs/docker-compose.yml stop
	@ echo -e "Containers stopped $(GREEN)successfully$(RESET)"

up:
	@ echo -e "$(BLUE)Restarting Containers$(RESET)"
	@docker compose -f ./srcs/docker-compose.yml up

fclean: clean
	@docker system prune -af

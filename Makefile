GREEN := \e[92m
GRAY := \e[90m
MAGENTA := \e[38;2;224;176;255m
BLUE := \e[38;2;80;150;255m
RESET := \e[0m
NAME = Transcendence
REQUIREMENTS = ./srcs/requirements
DB_DATA = ./data/database
DB_DOCKER = $(REQUIREMENTS)/database/data
NGINX_DATA = ./data/modsec_logs
VAULT_CERT_DIR = $(REQUIREMENTS)/hashicorp-vault
COMPOSE = compose -f ./srcs/docker-compose.yml -f ./srcs/docker-compose-devops.yml

IMAGE := pongchat-removebg-preview.png

all:
	@echo -e  "$(GRAY)Copying HOME/.env into ./srcs$(RESET)"
	@cp $(HOME)/.env srcs/.env
	@echo -e "$(BLUE)HOME/.env$(RESET) copied into ./srcs: $(GREEN)Success$(RESET)\n"
	@echo -e "$(GRAY)Copying HOME/secrets into $(REQUIREMENTS)/nginx/secrets$(RESET)"
	@cp -r $(HOME)/secrets $(REQUIREMENTS)/nginx
	@echo -e "$(BLUE)HOME/secrets$(RESET) copied into $(REQUIREMENTS)/nginx/secrets: $(GREEN)Success$(RESET)"
	@echo -e  "\n$(GRAY)Copying HOME/certs into $(VAULT_CERT_DIR)/certs$(RESET)"
	@cp -r $(HOME)/certs $(VAULT_CERT_DIR)
	@echo -e "$(BLUE)HOME/certs$(RESET) copied into $(VAULT_CERT_DIR)/certs: $(GREEN)Success$(RESET)"
	@echo -e "\n$(GRAY)Creating repositories for persistent data$(RESET)"
	@mkdir -p $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER)
	@ echo -e "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
	@echo -e "\n$(MAGENTA)$(NAME)$(RESET) ready!\n"
	@command -v chafa >/dev/null || { echo "Chafa n’est pas installé !"; exit 1; }
	@chafa --symbols=block --fill=block --size=40x40 $(IMAGE)
	@tsc
	@docker $(COMPOSE) up --build


clean:
	@docker images
	@echo -e ""
	@docker ps -a
	@echo -e ""
	@docker volume ls
	@echo -e ""
	@docker network ls
	@echo -e ""
	@echo -e  "$(BLUE)Removing containers$(RESET)"
	@docker stop $$(docker ps -qa) || true
	@docker rm $$(docker ps -qa) || true
	@docker rmi -f $$(docker images -qa) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm $(NAME) || true
	@rm -rf ./srcs/.env $(REQUIREMENTS)/nginx/secrets $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER) $(VAULT_CERT_DIR)/certs
	@echo -e "$(BLUE)./srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo -e "$(BLUE)./srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo -e "$(BLUE)$(VAULT_CERT_DIR)/certs$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo -e "$(BLUE)Repositories for persistent data$(RESET) removed: $(GREEN)Success$(RESET)\n"
	@docker images
	@echo -e ""
	@docker ps -a
	@echo -e ""
	@docker volume ls
	@echo -e ""
	@docker network ls
	@echo -e "Containers removed $(GREEN)successfully$(RESET)"
	@echo -e "\n$(MAGENTA)$(NAME)$(RESET) stop: $(GREEN)Success$(RESET)"

down:
	@docker $(COMPOSE) stop
	@echo -e "Containers stopped $(GREEN)successfully$(RESET)"

up:
	@echo -e "$(BLUE)Restarting Containers$(RESET)"
	@docker $(COMPOSE) up

fclean: clean
	@docker system prune -af

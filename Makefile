GREEN := \e[92m
GRAY := \e[90m
MAGENTA := \e[38;2;224;176;255m
BLUE := \e[38;2;80;150;255m
RED := \e[38;2;255;60;60m
BROWN := \e[38;2;150;75;0m
RESET := \e[0m
NAME = Transcendence
REQUIREMENTS = ./srcs/requirements
DB_DATA = ./data/database
DB_DOCKER = $(REQUIREMENTS)/database/data
COMPOSE = compose -f ./srcs/docker-compose.yml -f ./srcs/docker-compose-devops.yml

IMAGE := pongchat-removebg-preview.png

all:
	@echo -e  "$(GRAY)Copying HOME/.env into ./srcs$(RESET)"
	@cp $(HOME)/.env srcs/.env
	@echo -e "$(BLUE)HOME/.env$(RESET) copied into ./srcs: $(GREEN)Success$(RESET)\n"
	@echo -e "$(GRAY)Copying HOME/secrets into $(REQUIREMENTS)/nginx/secrets$(RESET)"
	@cp -r $(HOME)/secrets $(REQUIREMENTS)/nginx
	@echo -e "$(BLUE)HOME/secrets$(RESET) copied into $(REQUIREMENTS)/nginx/secrets: $(GREEN)Success$(RESET)"
	@echo -e "\n$(GRAY)Creating repositories for persistent data$(RESET)"
	@mkdir -p $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER)
	@echo "$(BLUE)Repositories for persistent data$(RESET) created: $(GREEN)Success$(RESET)\n"
	@echo "\n$(MAGENTA)$(NAME) ready!$(RESET)"
	@npm install -g typescript
	@npm install canvas-confetti
	@echo -e "⡏⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⡇"
	@echo -e "⡇ $(RED)⣿⡿⠛⠛⢿⣿ $(BROWN)⡇$(RED) ⣿⡿⠛⠛⢿⣿ $(BROWN)⡇$(RED) ⣿⡿  ⢿⣿ $(BROWN)⡇$(RED) ⣿⡿⠛⠛⢿⣿$(RESET)  ⡇"
	@echo -e "⡇ $(RED)⣿    ⣿ $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿⣿  ⣿⣿ $(BROWN)⡇$(RED) ⣿    ⠛  $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿⣿⣿⣿⣿⡟ $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿ ⢻ ⣿⣿ $(BROWN)⡇$(RED) ⣿       $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿      $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿  ⢷⣿⣿ $(BROWN)⡇$(RED) ⣿   ⠛⣿  $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿      $(BROWN)⡇$(RED) ⣿⣦⣤⣤⣾⣿ $(BROWN)⡇$(RED) ⣿   ⣿⣿ $(BROWN)⡇$(RED) ⣿⣿⣿⣿⣿⣿  $(RESET)⡇" 
	@echo -e "⣇⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⡇"
	@command -v chafa >/dev/null || { echo "Chafa n’est pas installé !"; exit 1; }
	@chafa --symbols=block --fill=block --size=40x40 $(IMAGE)
	@tsc
	@docker $(COMPOSE) up --build -d


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
	@rm -rf ./srcs/.env $(REQUIREMENTS)/nginx/secrets $(DB_DATA) $(NGINX_DATA) $(DB_DOCKER)
	@echo -e "$(BLUE)./srcs/.env$(RESET) removed: $(GREEN)Success$(RESET)"
	@echo -e "$(BLUE)./srcs/requirements/nginx/secrets$(RESET) removed: $(GREEN)Success$(RESET)"
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
	@echo -e "⡏⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⡇"
	@echo -e "⡇ $(RED)⣿⡿⠛⠛⢿⣿ $(BROWN)⡇$(RED) ⣿⡿⠛⠛⢿⣿ $(BROWN)⡇$(RED) ⣿⡿  ⢿⣿ $(BROWN)⡇$(RED) ⣿⡿⠛⠛⢿⣿$(RESET)  ⡇"
	@echo -e "⡇ $(RED)⣿    ⣿ $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿⣿  ⣿⣿ $(BROWN)⡇$(RED) ⣿    ⠛  $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿⣿⣿⣿⣿⡟ $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿ ⢻ ⣿⣿ $(BROWN)⡇$(RED) ⣿       $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿      $(BROWN)⡇$(RED) ⣿    ⣿ $(BROWN)⡇$(RED) ⣿  ⢷⣿⣿ $(BROWN)⡇$(RED) ⣿   ⠛⣿  $(RESET)⡇"
	@echo -e "⡇ $(RED)⣿      $(BROWN)⡇$(RED) ⣿⣦⣤⣤⣾⣿ $(BROWN)⡇$(RED) ⣿   ⣿⣿ $(BROWN)⡇$(RED) ⣿⣿⣿⣿⣿⣿  $(RESET)⡇" 
	@echo -e "⣇⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⡇"
	@command -v chafa >/dev/null || { echo "Chafa n’est pas installé !"; exit 1; }
	@chafa --symbols=block --fill=block --size=40x40 $(IMAGE)
	@echo "Containers removed $(GREEN)successfully$(RESET)"

down:
	@docker $(COMPOSE) stop
	@echo -e "Containers stopped $(GREEN)successfully$(RESET)"

up:
	@echo -e "$(BLUE)Restarting Containers$(RESET)"
	@docker $(COMPOSE) up

fclean: clean
	@docker system prune -af

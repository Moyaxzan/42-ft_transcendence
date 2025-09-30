#!/bin/bash

green='\e[32m'
blue='\e[34m'
reset='\e[0m'

if ! node --version &>/dev/null; then
        echo -e "${blue}Installing node${reset}"
        apt update && apt upgrade -y
        apt install -y nodejs
        echo -e "${green}Success:${reset} node is installed"
else
        echo -e "node is already installed"
fi

if ! npm --version &>/dev/null; then
        echo -e "${blue}Installing npm${reset}"
        apt update && apt upgrade -y
        apt install -y npm
        echo -e "${green}Success:${reset} npm is installed"
else
        echo -e "npm is already installed"
fi

if ! chafa --version &>/dev/null; then
        echo -e "${blue}Installing chafa${reset}"
        apt update && apt upgrade -y
        apt install -y chafa
        echo -e "${green}Success:${reset} chafa is installed"
else
        echo -e "chafa is already installed"
fi

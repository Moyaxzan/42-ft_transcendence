for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do  apt-get remove $pkg; done

# Set up Docker's apt repository
	# Install ca-certificates
if ! which ca-certificates &>/dev/null; then
	echo -e "\n${blue}Installing ca-certificates${reset}"
	 apt-get update
	 apt-get install ca-certificates curl
	echo -e "${green}Success:${reset} ca-certificates is installed"
else
	echo -e "Docker's GPG key is already installed"
fi

	# Add Docker's official GPG key
if [ ! -f /etc/apt/keyrings/docker.asc ]; then
	 install -m 0755 -d /etc/apt/keyrings
	 curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
	 chmod a+r /etc/apt/keyrings/docker.asc

	# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
   tee /etc/apt/sources.list.d/docker.list > /dev/null
 apt-get update
	echo -e "${green}Success:${reset} Docker's GPG key is installed"
else
	echo -e "Docker's GPG key is already installed"
fi

# Install docker
if ! which docker &>/dev/null; then
	echo -e "\n${blue}Installing Docker${reset}"
 apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
	echo -e "${green}Success:${reset} Docker is installed"
else
	echo -e "Docker is already installed"
fi

# Verify that the installation is successful
 docker run hello-world

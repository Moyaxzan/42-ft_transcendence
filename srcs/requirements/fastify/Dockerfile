# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	node:lts-alpine3.21@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd

WORKDIR	/usr/src/app

COPY	package*.json ./

RUN npm install #--production

COPY	. .

CMD	[ "npm", "run" ]

#COPY	--chmod=755 ./conf/envsubst.sh .
#COPY	--chmod=644 ./conf/default.conf.template /etc/nginx/conf.d/default.conf.template
#COPY	--chmod=777 ./conf/index.html /var/www/
#COPY	--chmod=644 ../secrets/transcendence.crt /etc/nginx/transcendence.crt
#COPY	--chmod=644 ../secrets/transcendence.key /etc/nginx/transcendence.key
#
## Sets configuration on the image that indicates a port the image would like to expose
#EXPOSE	443
#
#CMD ["./envsubst.sh"]
#
#HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
#    CMD wget -q --tries=1 --spider --no-check-certificate https://127.0.0.1:443/health; \
#    if [ $? -eq 0 ]; then exit 0; else exit 1; fi

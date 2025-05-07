# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	nginx:stable-alpine3.21@sha256:aed99734248e851764f1f2146835ecad42b5f994081fa6631cc5d79240891ec9

ARG 	PATH="./srcs/requirements/nginx/"

COPY	--chmod=755 ${PATH}/conf/envsubst.sh .
COPY	--chmod=644 ${PATH}/conf/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY	--chmod=777 ${PATH}/conf/index.html /var/www/
COPY	--chmod=644 ${PATH}/secrets/transcendence.crt /etc/nginx/transcendence.crt
COPY	--chmod=644 ${PATH}/secrets/transcendence.key /etc/nginx/transcendence.key
COPY	--chmod=755 ./srcs/requirements/fastify/db_connection/ /var/www/

# Sets configuration on the image that indicates a port the image would like to expose
EXPOSE	443

CMD ["./envsubst.sh"]

HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
    CMD wget -q --tries=1 --spider --no-check-certificate https://127.0.0.1:443/health; \
    if [ $? -eq 0 ]; then exit 0; else exit 1; fi

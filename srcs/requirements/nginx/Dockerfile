# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
#FROM	alpine:3.20@sha256:de4fe7064d8f98419ea6b49190df1abbf43450c1702eeb864fe9ced453c1cc5f
FROM	nginx:1.25-alpine

# Install the application dependencies
#RUN	apk add --no-cache nginx

# Copy files from the host and put them into the container image
COPY	--chmod=644 ./conf/nginx.conf /etc/nginx/http.d/
#COPY	--chmod=644 ../secrets/inception.crt ./etc/nginx/inception.crt
#COPY	--chmod=644 ../secrets/inception.key ./etc/nginx/inception.key

# Sets configuration on the image that indicates a port the image would like to expose
EXPOSE	443

# Sets the default command a container using this image will run
CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
    CMD wget -q --tries=1 --spider --no-check-certificate https://127.0.0.1:443/health; \
    if [ $? -eq 0 ]; then exit 0; else exit 1; fi

# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	nginx:stable-alpine3.21@sha256:aed99734248e851764f1f2146835ecad42b5f994081fa6631cc5d79240891ec9

ENV NGINX_VERSION=1.28.0

# COPY opt /opt

RUN apk add --no-cache \
    build-base pcre-dev pcre2-dev libxml2-dev git cmake \
    curl ca-certificates linux-headers yajl-dev \
    geoip-dev zlib-dev curl-dev lua5.3-dev \
    libmaxminddb-dev lmdb-dev \
    autoconf automake libtool && \
    mkdir -p /var/log/modsec_logs && \
    git clone --depth 1 -b v3/master --single-branch https://github.com/owasp-modsecurity/ModSecurity /opt/ModSecurity && \
    cd /opt/ModSecurity && \
    git submodule init && git submodule update && \
    ./build.sh && ./configure && make && make install && \
    git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx.git /opt/ModSecurity-nginx && \
    curl -L http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar zx && \
    cd nginx-$NGINX_VERSION && \
    ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules && \
    mkdir -p /etc/nginx/crs


# RUN mkdir -p /etc/nginx/crs && 
# curl -L https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.0.0.tar.gz | tar xz --strip-components=1 -C /etc/nginx/crs && \
# mv /etc/nginx/crs/crs-setup.conf.example /etc/nginx/crs/crs-setup.conf

# Clean and copy nginx config
RUN mkdir -p /etc/nginx/modules && mkdir -p /etc/nginx/conf.d

COPY modsecurity.conf /etc/nginx/modsecurity.conf

COPY ./CRS/ /etc/nginx/crs/

COPY	--chmod=755 ./conf/envsubst.sh .
COPY	--chmod=644 ./conf/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY	--chmod=644 ./secrets/transcendence.crt /etc/nginx/transcendence.crt
COPY	--chmod=644 ./secrets/transcendence.key /etc/nginx/transcendence.key

# Sets configuration on the image that indicates a port the image would like to expose
EXPOSE	443

CMD ["./envsubst.sh"]

HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
    CMD wget -q --tries=1 --spider --no-check-certificate https://127.0.0.1:443/health; \
    if [ $? -eq 0 ]; then exit 0; else exit 1; fi



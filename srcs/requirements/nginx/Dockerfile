# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	nginx:stable-alpine3.21@sha256:aed99734248e851764f1f2146835ecad42b5f994081fa6631cc5d79240891ec9

RUN apk add --no-cache \
    build-base pcre-dev pcre2-dev libxml2-dev git cmake \
    curl ca-certificates linux-headers yajl-dev \
    geoip-dev zlib-dev curl-dev lua5.3-dev \
    libmaxminddb-dev lmdb-dev \
    autoconf automake libtool

RUN git clone --depth 1 -b v3/master --single-branch https://github.com/owasp-modsecurity/ModSecurity /opt/ModSecurity && \
cd /opt/ModSecurity && \
git submodule init && \
git submodule update && \
./build.sh && \
./configure && \
make && make install


# Clone nginx connector
RUN git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx.git /opt/ModSecurity-nginx

# Download and build nginx with modsecurity module
ENV NGINX_VERSION=1.28.0

RUN curl -L http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar zx && \
    cd nginx-$NGINX_VERSION && \
    ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules

RUN mkdir -p /etc/nginx/crs && \
curl -L https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.0.0.tar.gz | tar xz --strip-components=1 -C /etc/nginx/crs && \
mv /etc/nginx/crs/crs-setup.conf.example /etc/nginx/crs/crs-setup.conf

# Clean and copy nginx config
RUN mkdir -p /etc/nginx/modules && mkdir -p /etc/nginx/conf.d

COPY modsecurity.conf /etc/nginx/modsecurity.conf
# COPY crs /etc/nginx/crs/

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


# syntax=docker/dockerfile:1

# FROM nginx@sha256:f6daac2445b0ce70e64d77442ccf62839f3f1b4c24bf6746a857eff014e798c8

# # Installe envsubst (inclus dans gettext) + wget (nécessaire au healthcheck)
# RUN apt-get update && apt-get install -y gettext wget && rm -rf /var/lib/apt/lists/*

# RUN apt-get update && apt-get install -y \
#     nginx \
#     gcc g++ make automake autoconf libtool \
#     libpcre3 libpcre3-dev zlib1g-dev libssl-dev  libpcre2-dev \
#     git curl wget \
#     libxml2-dev libyajl-dev libcurl4-openssl-dev \
#     libgeoip-dev pkg-config doxygen ca-certificates \
#     apache2-utils \
#     && apt-get clean

# # -----------------------------
# # Étape 1 : Compiler ModSecurity
# # -----------------------------
# RUN git clone --depth 1 https://github.com//owasp-modsecurity/ModSecurity && \
#     cd ModSecurity && \
#     git submodule init && git submodule update && \
#     ./build.sh && \
#     ./configure && \
#     make && make install

#     # -----------------------------
# # Étape 2 : Compiler nginx avec le module ModSecurity
# # -----------------------------
# RUN cd /opt && \
#     wget http://nginx.org/download/nginx-1.24.0.tar.gz && \
#     tar -xvzf nginx-1.24.0.tar.gz && \
#     git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx.git && \
#     cd nginx-1.24.0 && \
#     ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
#     make modules && \
#     mkdir -p /etc/nginx/modules && \
#     cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# # -----------------------------
# # Étape 3 : OWASP CRS
# # -----------------------------
# RUN mkdir -p /etc/nginx/modsec && \
#     git clone --depth 1 https://github.com/coreruleset/coreruleset.git /etc/nginx/modsec/crs && \
#     mv /etc/nginx/modsec/crs/crs-setup.conf.example /etc/nginx/modsec/crs/crs-setup.conf

# # -----------------------------
# # Étape 4 : Configuration ModSecurity
# # -----------------------------
# COPY ./modsecurity.conf /etc/nginx/modsec/modsecurity.conf

# # Charger le module ModSecurity
# RUN echo "load_module modules/ngx_http_modsecurity_module.so;" | cat - /etc/nginx/nginx.conf > temp && mv temp /etc/nginx/nginx.conf


# # Copie des fichiers
# COPY --chmod=755 ./conf/envsubst.sh /
# COPY --chmod=644 ./conf/default.conf.template /etc/nginx/conf.d/default.conf.template
# COPY --chmod=644 ./secrets/transcendence.crt /etc/nginx/transcendence.crt
# COPY --chmod=644 ./secrets/transcendence.key /etc/nginx/transcendence.key

# EXPOSE 443

# CMD ["/envsubst.sh"]

# HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
#     CMD wget -q --tries=1 --spider --no-check-certificate https://127.0.0.1:443/health || exit 1

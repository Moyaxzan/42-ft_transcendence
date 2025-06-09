#!bin/ash

envsubst '${DOMAIN_NAME}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
# Générer nginx.conf avec modsecurity
cat <<EOF > /etc/nginx/nginx.conf
load_module /etc/nginx/modules/ngx_http_modsecurity_module.so;

user nginx;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity.conf;

    include /etc/nginx/conf.d/*.conf;
}
EOF

# Lancer Nginx
exec nginx -g "daemon off;"
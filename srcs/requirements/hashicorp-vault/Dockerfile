FROM vault:1.15

COPY config/vault-config.hcl /vault/config/vault-config.hcl

CMD ["vault", "server", "-config=/vault/config/vault-config.hcl"]

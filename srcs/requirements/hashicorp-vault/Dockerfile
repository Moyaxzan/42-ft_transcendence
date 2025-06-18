FROM hashicorp/vault:latest

COPY config/vault-config.hcl /vault/config/vault-config.hcl

CMD ["vault", "server", "-config=/vault/config/vault-config.hcl"]

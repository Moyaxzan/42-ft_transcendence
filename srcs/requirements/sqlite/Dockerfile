# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	alpine:3.20@sha256:de4fe7064d8f98419ea6b49190df1abbf43450c1702eeb864fe9ced453c1cc5f

RUN apk add --no-cache sqlite

WORKDIR /database

CMD ["sqlite3", "database.db"]

HEALTHCHECK	--interval=10s --timeout=1s --start-period=10s --retries=3 \
	CMD sqlite3 /database/database.db "SELECT 1" | grep -qE "sqlite is alive"; \
	if [ $? -eq 0 ]; then exit 0; else exit 1; fi

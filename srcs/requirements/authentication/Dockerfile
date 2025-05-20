# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM	node:lts-alpine3.21@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd

RUN apk add --no-cache curl

COPY	package*.json ./

RUN 	npm install

COPY	. .
COPY	--chmod=755 edit_db.sh .

CMD	[ "npm", "--trace-warnings", "start" ]

## Sets configuration on the image that indicates a port the image would like to expose
EXPOSE	3000

HEALTHCHECK --interval=3s --timeout=1s --start-period=5s --retries=3 \
	CMD curl --fail http://localhost:3000/health || exit 1

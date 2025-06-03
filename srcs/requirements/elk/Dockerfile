# syntax=docker/dockerfile:1

# To fully secure your supply chain integrity, you can pin the image version to a specific digest.
# By pinning your images to a digest, you're guaranteed to always use the same image version, even if a publisher replaces the tag with a new image
FROM elasticsearch@sha256:9a0b12e7371138c1787ecff96f7ff2a6db40812cd5806b2672ef0e9c20e4a1e8

COPY elasticsearch.yml /usr/share/elasticsearch/config/

RUN apk add --no-cache curl

## Sets configuration on the image that indicates a port the image would like to expose
EXPOSE	9200

HEALTHCHECK --interval=3s --timeout=1s --start-period=20s --retries=3 \
	CMD curl localhost:9200/_cluster/health || exit 1

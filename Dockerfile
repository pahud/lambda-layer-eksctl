# FROM lambci/lambda:provided as runtime
ARG DOCKER_MIRROR=''
FROM ${DOCKER_MIRROR}alpine:latest

RUN \
	apk -Uuv add bash zip curl
USER root

RUN mkdir -p /opt/eksctl; \
curl --silent --location "https://github.com/weaveworks/eksctl/releases/download/latest_release/eksctl_$(uname -s)_amd64.tar.gz" | \
tar xz -C /tmp; mv /tmp/eksctl /opt/eksctl/

# wrap it up
RUN cd /opt; zip -r ../layer.zip *; \
echo "/layer.zip is ready"; \
ls -alh /layer.zip;

# generation version
RUN /opt/eksctl/eksctl version | cut -d\" -f 6 > /VERSION && \
cat /VERSION

FROM cassandra

RUN apt-get -qq update && \
    DEBIAN_FRONTEND=noninteractive apt-get -yq install dnsutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
COPY ready-probe.sh /
RUN chmod +x ready-probe.sh
COPY run.sh /
RUN chmod +x run.sh
ENTRYPOINT ["bash","run.sh"]
CMD ["cassandra", "-f"]
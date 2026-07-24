FROM postgres:17-alpine

RUN apk add --no-cache \
        restic \
        tzdata

COPY scripts/backup-manager.sh /usr/local/bin/backup-manager

RUN chmod 755 /usr/local/bin/backup-manager

ENTRYPOINT ["/usr/local/bin/backup-manager"]
CMD ["help"]

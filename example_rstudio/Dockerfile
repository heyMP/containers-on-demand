FROM rocker/rstudio

COPY ./rserver.conf /etc/rstudio/rserver.conf

HEALTHCHECK --retries=3 --timeout=30s CMD wget http://localhost:8787 || exit 1
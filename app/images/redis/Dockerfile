FROM redis:7.0.4

WORKDIR /

COPY /run.sh    .
RUN chmod +x    run.sh

CMD ["./run.sh"]
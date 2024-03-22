FROM python:3.9-alpine

# Install Prerequises
RUN apk add --no-cache build-base linux-headers


COPY        /run.sh         /run.sh
COPY        /srcs           /app

RUN         chmod +x run.sh


# Start
CMD ["./run.sh"]
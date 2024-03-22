FROM nginx:1.23.1

# Config File
COPY ./default.conf /etc/nginx/conf.d/default.conf

# SSL
RUN mkdir -p    /ssl
COPY ./ssl      /ssl

# Get rid of the annoying icon error
COPY ./favicon.ico /etc/nginx/html/favicon.ico

# Script
COPY ./run.sh   /run.sh
RUN chmod +x    /run.sh

CMD ["./run.sh"]
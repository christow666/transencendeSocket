#!/bin/sh
 
print_green() {
    echo "\033[32m[+] $@\033[0m"
}



print_green "Waiting for Daphne to Start"
while [ ! -e "/sock/daphne.sock" ]; do
    sleep 0.3
done
print_green "Nginx Starting"




exec nginx -g "daemon off;"

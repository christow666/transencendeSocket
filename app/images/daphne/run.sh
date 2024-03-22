#!/bin/sh

print_green() {
    echo -e "\033[32m[+] $@\033[0m"
}

# Delete old Daphne Socket
rm -rf "/app/game_config/daphne.sock"
rm -rf "/app/game_config/daphne.sock.lock"



if [ ! -e "/venv/.done" ]; then

    # Settings up Python
    print_green "Creating Venv"
    python3 -m venv /venv

    print_green "Activating Venv"
    source /venv/bin/activate

    print_green "Upgrading Pip"
    pip install --upgrade pip

    print_green "Installing Daphne"
    pip install daphne

    # print_green "Installing Python-Dotenv"
    # pip install python-dotenv

    print_green "Installing Channels"
    pip install channels

    print_green "Installing Channels redis"
    pip install channels_redis

    # print_green "Installing gUnicorn"
    # pip install gunicorn

    # print_green "Installing Twisted"
    # pip install twisted

    print_green "Installing Twisted - HTTP2 & TLS"
    pip install "Twisted[http2,tls]"

    # Little file that just tells us that everything is installed
    touch /venv/.done

else
    print_green "Activating Venv"
    source /venv/bin/activate
fi

# Starting Daphne
cd /app
print_green "Starting Daphne"
daphne -u /app/game_config/daphne.sock game_config.asgi:application

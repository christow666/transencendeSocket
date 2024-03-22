#!/usr/bin/env python


import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.game_config.settings.local')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as e:
        print(f"[-] Couldn't import Django {e}")
        exit(1)
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

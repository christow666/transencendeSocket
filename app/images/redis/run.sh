#!/bin/sh

echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf

redis-server --save "" --appendonly no --maxmemory 512mb
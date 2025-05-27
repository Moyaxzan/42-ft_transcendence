#!/bin/ash

curl -X POST -d '{"id_is": 1, "name": "je suis un test", "ip_address": "127.0.0.1", "points": "ok"}' -H "Content-Type: application/json" http://database:3000/users/login

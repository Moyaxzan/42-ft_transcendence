#!/bin/ash


curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Camelia", "id_token": "gjghkjvc56", "email": "calue@gfdg.fr"}'

curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Tao"}'

curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Elsa"}'

	

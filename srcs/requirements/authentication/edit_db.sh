#!/bin/ash

curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Camelia", "id_token": "ghjkhjghkjvc56", "email": "calue@gfdgW.fr"}'

curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Tao", "id_token": "gjghkjvcfds56", "email": "calue@gfds.fr"}'

curl -X POST http://database:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{"name": "Elsa", "id_token": "gjghkjvdsc56", "email": "calusde@gfdg.fr"}'

	

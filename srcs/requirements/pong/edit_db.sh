#!/bin/ash


curl -X POST http://database:3000/users \
	-H "Content-Type: application/json" \
	-d '{"name": "Camelia"}'

curl -X POST http://database:3000/users \
	-H "Content-Type: application/json" \
	-d '{"name": "Tao"}'

curl -X POST http://database:3000/users \
	-H "Content-Type: application/json" \
	-d '{"name": "Elsa"}'

	

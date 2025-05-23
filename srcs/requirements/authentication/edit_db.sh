#!/bin/ash

url="http://database:3000/users/login"
header="Content-Type: application/json"

generate_random_name() {
	name="user_$(head -c 3 /dev/urandom | od -An -tx1 | tr -d ' \n')"
}

generate_random_ip() {
    	ip_address="$((RANDOM % 256)).$((RANDOM % 256)).$((RANDOM % 256)).$((RANDOM % 256))"
}

run_curl() {
	json="{\"name\": \"$name\", \"ip_address\": \"$ip_address\"}"
	echo "POST: $json"
	curl -X POST -d "$json" -H "$header" "$url"
}

i=0
while [ $i -lt 5 ]; do
	generate_random_name
	generate_random_ip
	run_curl
	i=$((i+1))
done

CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 is_ia NUMERIC DEFAULT 0,
 name TEXT UNIQUE NOT NULL,
 email TEXT UNIQUE DEFAULT NULL,
 id_token TEXT UNIQUE DEFAULT NULL,
 password_hash TEXT UNIQUE DEFAULT NULL,
 reset_token TEXT UNIQUE DEFAULT NULL,
 reset_expiry NUMERIC DEFAULT 0,
 ip_address TEXT NOT NULL,
 is_log NUMERIC DEFAULT 0,
 points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 status NUMERIC DEFAULT 0,
 winner_id INTEGER,
 FOREIGN KEY (winner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS users_join_matches (
 id INTEGER PRIMARY KEY,
 user_id INTEGER,
 match_id INTEGER,
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (match_id) REFERENCES matches(id)
);


INSERT INTO users (id, name, email, id_token, password_hash, ip_address) VALUES (0, "Antoine", "test@gmail.com", "null", "$2b$10$eCXJmmeGeqUPYjdALWtqrO.jKOB0BarWsFcEgwlzKGv1F.lS6yLfe", "127.0.0.1");
INSERT INTO users (name, ip_address) VALUES ("Jovica", "127.0.0.1");

INSERT INTO matches (id, winner_id) VALUES (0, 45);
 


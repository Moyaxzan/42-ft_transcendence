CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 is_ia NUMERIC DEFAULT 0,
 google_user NUMERIC DEFAULT 0,
 name TEXT UNIQUE NOT NULL,
 email TEXT UNIQUE DEFAULT NULL,
 id_token TEXT UNIQUE DEFAULT NULL,
 password_hash TEXT UNIQUE DEFAULT NULL,
 reset_token TEXT UNIQUE DEFAULT NULL,
 reset_expiry NUMERIC DEFAULT 0,
 twofa_enabled NUMERIC DEFAULT 1,
 twofa_secret TEXT DEFAULT NULL,
 ip_address TEXT NOT NULL,
 is_log NUMERIC DEFAULT 0,
 points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 status NUMERIC DEFAULT 0,
 user_id INTEGER,
 winner_id INTEGER,
 score INTEGER NOT NULL,
 opponent_score INTEGER NOT NULL,
 opponent_id INTEGER NOT NULL,
 match_round INTEGER,
 match_index INTEGER,
 FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS users_join_matches (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 match_id INTEGER,
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS tournaments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS users_join_tournaments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 tournament_id INTEGER,
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE IF NOT EXISTS user_stats (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 total_matches INTEGER, 
 total_wins INTEGER, 
 total_losses INTEGER, 
 tournaments_played INTEGER, 
 tournaments_won INTEGER, 
 win_rate INTEGER, 
 FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, name, email, id_token, password_hash, ip_address, twofa_enabled) VALUES (0, "Antoine", "test@gmail.com", "null", "$2b$10$eCXJmmeGeqUPYjdALWtqrO.jKOB0BarWsFcEgwlzKGv1F.lS6yLfe", "127.0.0.1", 1);

INSERT INTO users (name, ip_address) VALUES ("Jovica", "127.0.0.1");

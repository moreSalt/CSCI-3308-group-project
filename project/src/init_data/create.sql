-- -- using CREATE TABLE IF NOT EXISTS:l ensures that existing data is not lost due to the table being dropped and recreated
-- -- For Login in Page and Creating a user
-- CREATE TABLE IF NOT EXISTS users(
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(70) NOT NULL,
--     image_url VARCHAR(255) NOT NULL
-- );

-- -- Comments Database
-- CREATE TABLE IF NOT EXISTS comments (
--     id SERIAL PRIMARY KEY,
--     comment_text TEXT NOT NULL,
--     user_id INT NOT NULL,
--     created_id TIMESTAMP,
--     FOREIGN KEY(user_id) REFERENCES users(id)
-- );
-- -- likes databases
-- CREATE TABLE IF NOT EXISTS likes (
--     user_id INT NOT NULL,
--     created_at TIMESTAMP,
--     FOREIGN KEY(user_id) REFERENCES users(id),
--     PRIMARY KEY(user_id)
-- );

-- THE ABOVE WAS CAUSING ERRORS

-- using CREATE TABLE IF NOT EXISTS:l ensures that existing data is not lost due to the table being dropped and recreated
-- For Login in Page and Creating a user
CREATE TABLE IF NOT EXISTS users(
    username VARCHAR(16) PRIMARY KEY,
    password VARCHAR(70) NOT NULL
);
-- CREATE TABLE IF NOT EXISTS reviews;
-- For Reviews have users_id with the text, rating, and date
CREATE TABLE IF NOT EXISTS reviews(
    id SERIAL PRIMARY KEY,
    comic_id INT NOT NULL,
    review VARCHAR(256) NOT NULL,
    rating INT NOT NULL,
    username VARCHAR(16) NOT NULL,
    ts timestamp default current_timestamp
);
DROP TABLE IF EXISTS users;
-- For Login in Page and Creating a user
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(70) NOT NULL
);
DROP TABLE IF EXISTS reviews;
-- For Reviews have users_id with the text, rating, and date
CREATE TABLE reviews(
    review TEXT NOT NULL,
    rating FLOAT NOT NULL,
    date DATE NOT NULL
);
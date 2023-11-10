-- For Login in Page and Creating a user
CREATE TABLE users(
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
);
-- For Reviews have users_id with the text, rating, and date
CREATE TABLE reviews(
    review TEXT NOT NULL,
    rating FLOAT NOT NULL,
    date DATE NOT NULL,
);
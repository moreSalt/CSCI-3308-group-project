-- using CREATE TABLE IF NOT EXISTS:l ensures that existing data is not lost due to the table being dropped and recreated

-- For Login in Page and Creating a user
CREATE TABLE IF NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(70) NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews;
-- For Reviews have users_id with the text, rating, and date
CREATE TABLE reviews(
    review TEXT NOT NULL,
    rating FLOAT NOT NULL,
    review_date DATE NOT NULL
);
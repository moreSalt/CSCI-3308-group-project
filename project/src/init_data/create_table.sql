-- For Login in Page and Creating a user
CREATE TABLE users(
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    users_id INT AUTO_INCREMENT PRIMARY KEY
);
-- For Reviews have users_id with the text, rating, and date
CREATE TABLE reviews(
    users_id INT NOT NULL,
    FOREIGN KEY (users_id) REFERENCES users(users_id),
    review TEXT NOT NULL,
    rating FLOAT NOT NULL,
    date DATE NOT NULL,
);
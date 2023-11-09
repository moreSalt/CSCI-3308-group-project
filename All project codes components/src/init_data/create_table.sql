create TABLE users(
    username VARCHAR(50) NOT NULL,
    password VARCHAR(20) NOT NULL,
    users_id INT AUTO_INCREMENT PRIMARY KEY
);
CREATE TABLE reviews(
    users_id INT NOT NULL,
)
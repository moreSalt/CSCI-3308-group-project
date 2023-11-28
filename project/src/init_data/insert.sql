-- INSERT INTO users (username) VALUES
-- ('Paul'),
-- ('Alexis'),
-- ('Aaron');

-- INSERT INTO photos (image_url, user_id) VALUES
-- ('/images/1.jpg', 2),
-- ('/images/2.jpg', 3),
-- ('/images/3.jpg', 1);

INSERT INTO reviews(comic_id, review, rating, username) VALUES (502, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', 3, 'admin_of_admins');
-- (502, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Euismod in pellentesque massa placerat duis ultricies.", 5, "example_user"),
-- (502, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id semper risus in hendrerit gravida rutrum.", 4, "i_luv_spiderman");


    -- id SERIAL PRIMARY KEY
    -- comid_id int NOT NULL
    -- review TEXT NOT NULL,
    -- rating INT NOT NULL,
    -- username VARCHAR(16) NOT NULL
    -- ts timestamp default current_timestamp
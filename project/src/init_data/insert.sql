--INSERT INTO reviews(comic_id, review, rating, username) VALUES (502, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', 3, 'admin_of_admins');
-- INSERT INTO users (username) VALUES
-- ('Paul'),
-- ('Alexis'),
-- ('Aaron');

-- INSERT INTO photos (image_url, user_id) VALUES
-- ('/images/1.jpg', 2),
-- ('/images/2.jpg', 3),
-- ('/images/3.jpg', 1);


-- (502, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Euismod in pellentesque massa placerat duis ultricies.", 5, "example_user"),
-- (502, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id semper risus in hendrerit gravida rutrum.", 4, "i_luv_spiderman");

INSERT INTO groups(id, about, username) VALUES ('Welcome', 'This group is a good for any noob to visit', 'admin');

INSERT INTO messages(content, username, group_id) VALUES ('Welcome all to Marvel Comic Reviews!', 'admin', 'Welcome');
INSERT INTO messages(content, username, group_id) VALUES ('Wow what a place :)', 'admin_of_admins', 'Welcome');


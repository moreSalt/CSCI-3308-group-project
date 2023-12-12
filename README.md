Marvel Comic Reviews Application README.md

Overview
Marvel Comic Reviews is a full-stack web application that provides a platform for comic enthusiasts to explore, review, and discuss Marvel comics. The application is built using Node.js, Express, FeathersJS, and PostgreSQL, offering features like user registration, login, comic discovery, and group discussions.

Features:
User Authentication: Secure login and registration system.
Profile Management: Users can update their username and password.
Comic Reviews: Users can post and view reviews for different comics.
Comic Discovery: A feature for finding new comics based on various criteria.
Group Discussions: Allows users to join and participate in group discussions.
Real-time Interaction: Implemented using FeathersJS and socket.io for live updates in group chats.
Technology Stack
Backend: Node.js with Express and FeathersJS.
Database: PostgreSQL.
Frontend: EJS templating for dynamic page rendering.
Authentication: bcrypt for password hashing.
Session Management: express-session.
APIs: Marvel Comics API for fetching comic details.
Installation

Clone the repository:
git clone git@github.com:moreSalt/CSCI-3308-group-project.git

Navigate to the project directory:
cd /CSCI-3308-GROUP-PROJECT/project

Run Docker Compose:
docker-compose up

Usage
After installation, the application will be running on localhost:3000.
Users need to register and log in to access the full features of the app.

Important Commands
To stop the Docker containers:
docker-compose down 

To remove Docker volumes (Warning: This will erase all data):
docker-compose down -v

Testing
The application includes a suite of user acceptance tests for key features like registration, login, and posting reviews.

## MAKE SURE TO RUN `docker compose down -v`, else testing will fail and other wack issues

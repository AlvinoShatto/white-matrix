-- Create database
CREATE DATABASE IF NOT EXISTS voting_platform;
USE voting_platform;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    linkedin_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    profile_description TEXT,
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table with unique constraint on user_id
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    candidate_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Insert sample candidates
INSERT INTO candidates (name, profile_description, linkedin_url) VALUES
('John Doe', 'Experienced leader with 10+ years in technology and innovation. Passionate about driving positive change.', 'https://linkedin.com/in/johndoe'),
('Jane Smith', 'Strategic thinker and collaborative team player. Dedicated to building inclusive communities.', 'https://linkedin.com/in/janesmith')
ON DUPLICATE KEY UPDATE name=name;




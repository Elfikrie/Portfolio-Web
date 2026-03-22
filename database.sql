-- Create Database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- 1. Users (Admin) Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: The password hash below is for 'fikrieguanteng123' generated with bcrypt (cost=10)
INSERT INTO users (username, password_hash) 
VALUES ('fikrieganteng', '$2b$10$2lK.TPTOoGAWISZyPBoweuqWln1ek3hH0Cm5sBGljZXO5xFgroZV.')
ON DUPLICATE KEY UPDATE username=username;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  demoUrl VARCHAR(255),
  imageUrl VARCHAR(255) NOT NULL,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSON,
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level INT NOT NULL,
  type ENUM('hard', 'soft') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Comments Table (For Notes)
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT NOT NULL,
  author VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

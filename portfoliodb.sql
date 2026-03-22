-- Portfolio Database Schema

CREATE DATABASE IF NOT EXISTS `portfolio_db`;
USE `portfolio_db`;

-- Users (Admin) Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `demoUrl` VARCHAR(255),
  `imageUrl` VARCHAR(255),
  `tags` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `tags` JSON,
  `date` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS `skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `level` INT NOT NULL DEFAULT 50,
  `type` ENUM('hard', 'soft') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experience Table
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations Table
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Seeder
-- Username: fikrieganteng
-- Password: fikrieguanteng123
INSERT IGNORE INTO `users` (`username`, `password_hash`) 
VALUES ('fikrieganteng', '$2b$10$2lK.TPTOoGAWISZyPBoweuqWln1ek3hH0Cm5sBGljZXO5xFgroZV.');

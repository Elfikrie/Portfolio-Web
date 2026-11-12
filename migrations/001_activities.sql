CREATE TABLE IF NOT EXISTS activities (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  activity_date DATE NOT NULL,
  description VARCHAR(1000) NOT NULL,
  image_key VARCHAR(80) NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  revision INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX activities_public_date (status, activity_date, id)
);

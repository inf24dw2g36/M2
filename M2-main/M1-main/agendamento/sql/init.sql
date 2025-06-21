-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS Scheduler
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

-- Uso do banco de dados
USE Scheduler;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    google_id VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty_id INT,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    user_id INT,
    doctor_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

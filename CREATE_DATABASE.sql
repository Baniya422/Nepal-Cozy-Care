-- SQL Script to create database in XAMPP/phpMyAdmin
-- Run this in phpMyAdmin SQL tab

-- Create the project database only if it does not already exist.
CREATE DATABASE IF NOT EXISTS nepal_cozy_care 
-- Use utf8mb4 so names, symbols, and multilingual text are stored safely.
CHARACTER SET utf8mb4 
-- Use a Unicode collation that compares text consistently.
COLLATE utf8mb4_unicode_ci;

-- Verify the database was created
SHOW DATABASES LIKE 'nepal_cozy_care';

-- Migration: Convert Argon2 password hashes to bcrypt
-- This script updates the admin password hash from argon2 to bcrypt format
-- Run this after deploying the bcryptjs version

-- The bcrypt hash below is for password: S0m3b0dy!984
-- Generated with bcrypt.hash('S0m3b0dy!984', 10)

UPDATE admins 
SET password_hash = '$2a$10$aOVUixGomS33KbTY81QDBOf/pwd9c4V10y/EX017y947tnnwKBh.u'
WHERE username = 'administrator@root';

-- Verify the update
SELECT username, 
       CASE 
         WHEN password_hash LIKE '$argon2%' THEN 'ARGON2 (needs update)'
         WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' THEN 'BCRYPT (updated)'
         ELSE 'UNKNOWN'
       END as hash_type
FROM admins;

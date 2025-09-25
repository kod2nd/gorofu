-- Seed data for the Golf App
-- This file contains sample data to populate the database for development and testing.

-- Insert some sample Singapore courses
-- This data is required for the sample tee box data below.
INSERT INTO courses (name, country, city, created_by, is_verified) VALUES
('Sentosa Golf Club - Serapong Course', 'Singapore', 'Sentosa', 'system@golfapp.com', true),
('Singapore Island Country Club - Island Course', 'Singapore', 'Upper Thomson', 'system@golfapp.com', true),
('Tanah Merah Country Club - Garden Course', 'Singapore', 'Changi', 'system@golfapp.com', true),
('Marina Bay Golf Course', 'Singapore', 'Marina Bay', 'system@golfapp.com', true),
('Raffles Country Club', 'Singapore', 'Tuas', 'system@golfapp.com', true);

-- Sample tee box data for Sentosa Serapong (Championship tees)
INSERT INTO course_tee_boxes (course_id, tee_box, hole_number, par, distance, yards_or_meters_unit, last_updated_by)
SELECT 
  c.id,
  'Championship' AS tee_box,
  hole_num,
  CASE
    WHEN hole_num IN (3, 5, 8, 11, 16) THEN 3
    WHEN hole_num IN (2, 6, 9, 13, 15, 18) THEN 5
    ELSE 4
  END AS par,
  CASE hole_num
    WHEN 1 THEN 365 WHEN 2 THEN 505 WHEN 3 THEN 155 WHEN 4 THEN 380 WHEN 5 THEN 175
    WHEN 6 THEN 520 WHEN 7 THEN 410 WHEN 8 THEN 165 WHEN 9 THEN 425 WHEN 10 THEN 395
    WHEN 11 THEN 185 WHEN 12 THEN 440 WHEN 13 THEN 545 WHEN 14 THEN 360 WHEN 15 THEN 485
    WHEN 16 THEN 140 WHEN 17 THEN 415 WHEN 18 THEN 560
  END AS distance,
  'yards' AS yards_or_meters_unit,
  'system@golfapp.com' AS last_updated_by
FROM generate_series(1, 18) AS hole_num
CROSS JOIN (SELECT id FROM courses WHERE name = 'Sentosa Golf Club - Serapong Course') AS c;
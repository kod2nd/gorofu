-- Backfill script to update the is_eligible_round column for all existing rounds.
-- This script calculates the number of holes played for each round and sets the
-- is_eligible_round flag based on the following logic:
-- - 18-hole rounds are eligible if >= 14 holes were played.
-- - 9-hole rounds are eligible if >= 7 holes were played.

-- It's recommended to run this script once after deploying the schema changes.

UPDATE rounds
SET is_eligible_round =
    CASE
        WHEN rounds.round_type = '18_holes' AND COALESCE(ph.count, 0) >= 14 THEN TRUE
        WHEN rounds.round_type = 'front_9' AND COALESCE(ph.count, 0) >= 7 THEN TRUE
        WHEN rounds.round_type = 'back_9' AND COALESCE(ph.count, 0) >= 7 THEN TRUE
        ELSE FALSE
    END
FROM (
    -- Subquery to count the number of played holes for each round
    SELECT round_id, COUNT(*) as count
    FROM round_holes
    GROUP BY round_id
) AS ph
WHERE rounds.id = ph.round_id;

-- Verify the backfill by checking a few rounds
SELECT id, round_type, total_holes_played, is_eligible_round
FROM rounds
ORDER BY created_at DESC
LIMIT 10;

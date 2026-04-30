-- vote_targets -> vote.json
-- Copy the output to vote.json
SELECT json_agg(
    json_build_object(
        'id', id,
        'name', name,
        'category', category
    ) ORDER BY category, display_order
)
FROM vote_targets;

-- Ensure previous_experience and additional_comments are never NULL
UPDATE lead_details
SET previous_experience = ''
WHERE previous_experience IS NULL;

UPDATE lead_details
SET additional_comments = ''
WHERE additional_comments IS NULL;

-- Ensure source_channel is never NULL
UPDATE lead_details
SET source_channel = 'unknown'
WHERE source_channel IS NULL OR source_channel = '';

-- Add realtime for lead_details
ALTER PUBLICATION supabase_realtime ADD TABLE lead_details;

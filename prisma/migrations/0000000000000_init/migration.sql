-- Create a sequence for the id 
CREATE SEQUENCE public.common_seq;

-- Create a function to generate the id
-- 48 bits for timestamp, 12 bits for sequence id - 60 bits total, 4 bits reserved at last
CREATE OR REPLACE FUNCTION public.next_id(OUT result bigint) AS $$
DECLARE
    start_epoch bigint := 1735689600000;
    seq_id bigint;
    now_millis bigint;
BEGIN
    SELECT MOD(nextval('public.common_seq'), 4096) INTO seq_id; -- 12 bits for sequence id
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - start_epoch) << (64 - 42); -- 64 bits total, 48 bits for timestamp
    result := result | (seq_id << (64 - 42 - 12));
END;
    $$ LANGUAGE PLPGSQL;
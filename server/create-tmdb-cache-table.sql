-- Create TMDB cache table for storing movie and TV show data
-- This allows serving content from database instead of API calls

CREATE TABLE IF NOT EXISTS tmdb_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    tmdb_id INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'movie' or 'tv'
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tmdb_cache_key ON tmdb_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_tmdb_cache_type ON tmdb_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_tmdb_cache_expires ON tmdb_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_tmdb_cache_tmdb_id ON tmdb_cache(tmdb_id);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_tmdb_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM tmdb_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active (non-expired) cache entries
CREATE OR REPLACE VIEW active_tmdb_cache AS
SELECT * FROM tmdb_cache
WHERE expires_at > NOW()
ORDER BY last_updated DESC;
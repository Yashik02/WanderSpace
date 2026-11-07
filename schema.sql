
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS public.profiles_username_lower_idx;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_exact_idx
    ON public.profiles (username);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        TRIM(COALESCE(
            NEW.raw_user_meta_data ->> 'username',
            split_part(NEW.email, '@', 1)
        ))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Trending',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL,
    author VARCHAR(100) DEFAULT 'Anonymous Guest',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 3. Helpful queries:
-- Calculate average rating and review count for all listings:
-- SELECT 
--     l.*, 
--     ROUND(AVG(r.rating), 1) AS avg_rating,
--     COUNT(r.id) AS review_count
-- FROM listings l
-- LEFT JOIN reviews r ON l.id = r.listing_id
-- GROUP BY l.id;

-- Existing database migration:
-- 1. Run the account and listing statements in seeds.sql.
-- 2. Then enforce ownership on an existing listings table:
-- UPDATE public.listings
-- SET user_id = '00000000-0000-0000-0000-000000000001'
-- WHERE user_id IS NULL;
-- ALTER TABLE public.listings ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
-- ALTER TABLE public.listings
--     ADD CONSTRAINT listings_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;
-- UPDATE public.reviews
-- SET user_id = '00000000-0000-0000-0000-000000000001'
-- WHERE user_id IS NULL;
-- ALTER TABLE public.reviews ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
-- ALTER TABLE public.reviews
--     ADD CONSTRAINT reviews_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

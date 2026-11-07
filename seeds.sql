-- WanderSpace sample data for Supabase Postgres.

-- Demo accounts for sample listing ownership.
-- Password for all three accounts: TestAccount123!
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'test.account.1@example.com',
    crypt('TestAccount123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"test account 1"}', NOW(), NOW(), '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'test.account.2@example.com',
    crypt('TestAccount123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"test account 2"}', NOW(), NOW(), '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'test.account.3@example.com',
    crypt('TestAccount123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"test account 3"}', NOW(), NOW(), '', '', '', ''
)
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, username)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'test account 1'),
    ('00000000-0000-0000-0000-000000000002', 'test account 2'),
    ('00000000-0000-0000-0000-000000000003', 'test account 3')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

DELETE FROM reviews;
DELETE FROM listings;
INSERT INTO listings (id, title, description, image, price, location, country, category, user_id) VALUES
('6670137d-7288-4822-8383-d121b4e00001', 'Malibu Oceanfront Sunset Villa', 'Wake up to panoramic Pacific ocean views and direct private beach access. Features an infinity pool, sun deck, and floor-to-ceiling glass walls.', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 6500, 'Malibu, California', 'United States', 'Beachfront', '00000000-0000-0000-0000-000000000001'),
('6670137d-7288-4822-8383-d121b4e00002', 'Aspen Pine Alpine Cabin', 'A cozy cedarwood sanctuary tucked inside towering pines. Complete with an authentic stone fireplace, hot tub under the stars, and ski-in/ski-out convenience.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 4200, 'Aspen, Colorado', 'United States', 'Cabins', '00000000-0000-0000-0000-000000000002'),
('6670137d-7288-4822-8383-d121b4e00003', 'Kyoto Traditional Machiya Suite', 'Step back into tranquility in this restored 120-year-old Machiya townhouse featuring tatami mat flooring, a private Zen rock garden, and wooden soaking bath.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', 2800, 'Kyoto, Kansai', 'Japan', 'Trending', '00000000-0000-0000-0000-000000000003'),
('6670137d-7288-4822-8383-d121b4e00004', 'Santorini Caldera Cave Haven', 'Perched on the legendary cliffs of Oia, this whitewashed cliffhouse boasts breathtaking Aegean sunsets, a heated plunge pool, and minimalist Cycladic architecture.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', 5200, 'Oia, Santorini', 'Greece', 'Beachfront', '00000000-0000-0000-0000-000000000001'),
('6670137d-7288-4822-8383-d121b4e00005', 'Tuscany Olive Grove Farmhouse', 'A romantic 18th-century stone farmhouse surrounded by rolling hills, vineyards, and olive groves. Features authentic wood beams and an outdoor pizza oven.', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 3100, 'Siena, Tuscany', 'Italy', 'Countryside', '00000000-0000-0000-0000-000000000002'),
('6670137d-7288-4822-8383-d121b4e00006', 'Beverly Hills Modern Luxury Estate', 'Architectural masterpiece with clean lines, resort-style heated pool, private gym, chef kitchen, and private gated motor court in the prestigious hills.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 8900, 'Beverly Hills, California', 'United States', 'Mansions', '00000000-0000-0000-0000-000000000003'),
('6670137d-7288-4822-8383-d121b4e00007', 'Brooklyn Industrial Designer Loft', 'Soaring 14-foot timber ceilings, exposed brick walls, vintage record collection, and sun-drenched industrial steel casement windows in Williamsburg.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 2400, 'Brooklyn, New York', 'United States', 'Lofts', '00000000-0000-0000-0000-000000000001'),
('6670137d-7288-4822-8383-d121b4e00008', 'Amalfi Coast Terraced Villa', 'Overlooking the sapphire waters of the Mediterranean, this cliffside villa features private lemon gardens, ceramic tile floors, and romantic sunset terraces.', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 4800, 'Positano, Amalfi', 'Italy', 'Trending', '00000000-0000-0000-0000-000000000002'),
('6670137d-7288-4822-8383-d121b4e00009', 'Swiss Alps Chalet Paradiso', 'A luxury wooden chalet overlooking snow-capped peaks. Cozy up near the central hearth or unwind on the wrap-around balcony with hot mulled cider.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80', 3900, 'Zermatt, Valais', 'Switzerland', 'Cabins', '00000000-0000-0000-0000-000000000003'),
('6670137d-7288-4822-8383-d121b4e0000a', 'Lakeside Glasshouse Retreat', 'Floor-to-ceiling glass sanctuary right by the peaceful lake shore. Enjoy morning kayak trips, private dock, fire pit, and uninterrupted stargazing.', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80', 2950, 'Lake Tahoe, Nevada', 'United States', 'Countryside', '00000000-0000-0000-0000-000000000001');

INSERT INTO reviews (id, listing_id, author, user_id, rating, comment) VALUES
('7770137d-7288-4822-8383-d121b4e00001', '6670137d-7288-4822-8383-d121b4e00001', 'Sarah Jenkins', '00000000-0000-0000-0000-000000000001', 5, 'The view of the ocean is unreal! Hearing the waves crash while falling asleep was magical.'),
('7770137d-7288-4822-8383-d121b4e00002', '6670137d-7288-4822-8383-d121b4e00001', 'Michael Chen', '00000000-0000-0000-0000-000000000002', 5, 'Exceptional stay. Clean, modern, and the sunset from the deck is unforgettable.'),
('7770137d-7288-4822-8383-d121b4e00003', '6670137d-7288-4822-8383-d121b4e00001', 'Elena Rostova', '00000000-0000-0000-0000-000000000003', 4, 'Wonderful place. A little windy on the patio in the evening, but the heated pool made up for it!'),
('7770137d-7288-4822-8383-d121b4e00004', '6670137d-7288-4822-8383-d121b4e00002', 'David Miller', '00000000-0000-0000-0000-000000000001', 5, 'Cozy cabin perfection. The fireplace and hot tub after a day of skiing were 10/10.'),
('7770137d-7288-4822-8383-d121b4e00005', '6670137d-7288-4822-8383-d121b4e00002', 'Jessica Taylor', '00000000-0000-0000-0000-000000000002', 4, 'Very comfortable beds and well-stocked kitchen. We will definitely visit again!'),
('7770137d-7288-4822-8383-d121b4e00006', '6670137d-7288-4822-8383-d121b4e00003', 'Kenji Sato', '00000000-0000-0000-0000-000000000003', 5, 'Truly authentic Japanese experience. The garden is tranquil and peaceful.'),
('7770137d-7288-4822-8383-d121b4e00007', '6670137d-7288-4822-8383-d121b4e00003', 'Amanda Fox', '00000000-0000-0000-0000-000000000001', 5, 'One of the best stays of my life. Spotless, historic, and beautifully maintained.'),
('7770137d-7288-4822-8383-d121b4e00008', '6670137d-7288-4822-8383-d121b4e00004', 'Liam O''Connor', '00000000-0000-0000-0000-000000000002', 5, 'The caldera views take your breath away every morning. Host was super welcoming.'),
('7770137d-7288-4822-8383-d121b4e00009', '6670137d-7288-4822-8383-d121b4e00004', 'Sophie Martin', '00000000-0000-0000-0000-000000000003', 4, 'A bit of a stair climb down the cliff, but well worth every step!'),
('7770137d-7288-4822-8383-d121b4e0000a', '6670137d-7288-4822-8383-d121b4e00004', 'Marcus Aurel', '00000000-0000-0000-0000-000000000001', 5, 'Pure paradise. Plunge pool facing the sunset is an experience you must have.'),
('7770137d-7288-4822-8383-d121b4e0000b', '6670137d-7288-4822-8383-d121b4e00005', 'Marco Rossi', '00000000-0000-0000-0000-000000000002', 5, 'Felt like stepping into a postcard. We baked homemade pizzas in the outdoor wood oven!'),
('7770137d-7288-4822-8383-d121b4e0000c', '6670137d-7288-4822-8383-d121b4e00005', 'Claire Dupont', '00000000-0000-0000-0000-000000000003', 5, 'Serene countryside, delicious local wines, and breathtaking landscape.'),
('7770137d-7288-4822-8383-d121b4e0000d', '6670137d-7288-4822-8383-d121b4e00005', 'Robert Lang', '00000000-0000-0000-0000-000000000001', 4, 'Peaceful and authentic. Renting a car is recommended to explore nearby towns.'),
('7770137d-7288-4822-8383-d121b4e0000e', '6670137d-7288-4822-8383-d121b4e00006', 'Jordan Smith', '00000000-0000-0000-0000-000000000002', 5, 'Pure luxury from start to finish. Security, privacy, and impeccable design.'),
('7770137d-7288-4822-8383-d121b4e0000f', '6670137d-7288-4822-8383-d121b4e00006', 'Victoria Vance', '00000000-0000-0000-0000-000000000003', 5, 'Spectacular property for our family retreat. The pool area is magnificent.'),
('7770137d-7288-4822-8383-d121b4e00010', '6670137d-7288-4822-8383-d121b4e00007', 'Alex Rivera', '00000000-0000-0000-0000-000000000001', 4, 'Great location in Williamsburg! Tons of coffee shops and bakeries around.'),
('7770137d-7288-4822-8383-d121b4e00011', '6670137d-7288-4822-8383-d121b4e00007', 'Maya Patel', '00000000-0000-0000-0000-000000000002', 4, 'Super stylish loft. Street can be a little lively on weekends but we loved the vibe.'),
('7770137d-7288-4822-8383-d121b4e00012', '6670137d-7288-4822-8383-d121b4e00007', 'Sam Wilson', '00000000-0000-0000-0000-000000000003', 5, 'Incredible high ceilings and natural lighting. Host was very responsive.');

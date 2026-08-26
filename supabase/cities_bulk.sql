-- ============================================================================
-- BizNest Pakistan — BULK CITY/TOWN SEED (storefront upgrade)
-- File: supabase/cities_bulk.sql
--
-- WHAT THIS FILE DOES:
--   Adds missing towns and tehsil headquarters to the `cities` table for
--   EVERY district seeded by supabase/migration.sql, across all provinces
--   (246 new rows). District Kasur alone gains 10 towns (Pattoki, Kot
--   Radha Kishan, Chunian, Phool Nagar, Kanganpur, Mustafabad, Raja Jang,
--   Allahabad, Khudian, Changa Manga) on top of Kasur city itself.
--
-- HOW TO RUN (non-technical owner):
--   Supabase Dashboard -> SQL Editor -> New Query -> paste this ENTIRE file
--   -> Run. RUN THIS AFTER supabase/feature_storefront.sql.
--
-- IDEMPOTENT & SAFE:
--   - Every district is one self-contained INSERT ... SELECT block.
--   - Rows only insert when the district exists (matched by slug) — if a
--     district is missing, that block silently inserts 0 rows.
--   - ON CONFLICT (district_id, slug) DO NOTHING: re-running never
--     duplicates and never overwrites existing cities.
--   - Nothing is deleted or updated.
--
-- NOTES:
--   - Each district's main city was already seeded by migration.sql; the
--     blocks below add the ADDITIONAL towns/tehsil HQs.
--   - Coordinates are approximate city-center latitude/longitude from
--     public gazetteer/GeoNames-style data (spot-checked; ±a few km is
--     normal for small towns).
--   - Slugs are prefixed with the district slug (e.g. kasur-pattoki) so
--     they stay globally unique; city NAMES display normally in the app.
-- ============================================================================

-- ===========================================================================
-- PUNJAB
-- ===========================================================================

-- ----- District: Lahore (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Raiwind', 'lahore-raiwind', 31.4116, 74.209),
  ('Kahna', 'lahore-kahna', 31.47, 74.38)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'lahore'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Rawalpindi (Punjab) — 5 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Murree', 'rawalpindi-murree', 33.907, 73.3943),
  ('Gujar Khan', 'rawalpindi-gujar-khan', 33.2544, 73.306),
  ('Taxila', 'rawalpindi-taxila', 33.746, 72.787),
  ('Kallar Syedan', 'rawalpindi-kallar-syedan', 33.3833, 73.3667),
  ('Kotli Sattian', 'rawalpindi-kotli-sattian', 33.8642, 73.5258)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'rawalpindi'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Faisalabad (Punjab) — 5 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Jaranwala', 'faisalabad-jaranwala', 31.3333, 73.4167),
  ('Samundri', 'faisalabad-samundri', 31.1, 73.15),
  ('Tandlianwala', 'faisalabad-tandlianwala', 31.03, 73.35),
  ('Dijkot', 'faisalabad-dijkot', 31.37, 72.98),
  ('Khurrianwala', 'faisalabad-khurrianwala', 31.47, 73.17)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'faisalabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Multan (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Shujabad', 'multan-shujabad', 29.88, 71.29),
  ('Jalalpur Pirwala', 'multan-jalalpur-pirwala', 29.65, 71.21)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'multan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Gujranwala (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Wazirabad', 'gujranwala-wazirabad', 32.4425, 74.12),
  ('Kamonke', 'gujranwala-kamonke', 31.974, 74.224),
  ('Nowshera Virkan', 'gujranwala-nowshera-virkan', 31.9667, 74.5333),
  ('Alipur Chatha', 'gujranwala-alipur-chatha', 32.1, 74.05)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'gujranwala'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sialkot (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Daska', 'sialkot-daska', 32.3242, 74.35),
  ('Sambrial', 'sialkot-sambrial', 32.475, 74.352),
  ('Pasrur', 'sialkot-pasrur', 32.2633, 74.6667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sialkot'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Bahawalpur (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Ahmadpur East', 'bahawalpur-ahmadpur-east', 29.1442, 71.2578),
  ('Hasilpur', 'bahawalpur-hasilpur', 29.6964, 72.5444),
  ('Khairpur Tamewali', 'bahawalpur-khairpur-tamewali', 29.5656, 72.2539),
  ('Yazman', 'bahawalpur-yazman', 29.1213, 71.7497)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'bahawalpur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sargodha (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Bhalwal', 'sargodha-bhalwal', 32.2653, 72.8975),
  ('Shahpur', 'sargodha-shahpur', 32.2667, 72.6667),
  ('Kot Momin', 'sargodha-kot-momin', 32.1864, 73.0297),
  ('Sahiwal (Sargodha)', 'sargodha-sahiwal-sargodha', 32.4333, 72.8667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sargodha'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Gujrat (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kharian', 'gujrat-kharian', 32.8153, 73.8656),
  ('Lala Musa', 'gujrat-lala-musa', 32.7, 73.9667),
  ('Sarai Alamgir', 'gujrat-sarai-alamgir', 32.8833, 73.75),
  ('Kunjah', 'gujrat-kunjah', 32.5333, 74.0333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'gujrat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sheikhupura (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Muridke', 'sheikhupura-muridke', 31.8, 74.25),
  ('Sharqpur', 'sheikhupura-sharqpur', 31.46, 74.1),
  ('Ferozewala', 'sheikhupura-ferozewala', 31.8517, 74.2931),
  ('Safdarabad', 'sheikhupura-safdarabad', 31.8667, 73.6667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sheikhupura'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Rahim Yar Khan (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sadiqabad', 'rahim-yar-khan-sadiqabad', 28.3092, 70.1306),
  ('Khanpur', 'rahim-yar-khan-khanpur', 28.6469, 70.6578),
  ('Liaquatpur', 'rahim-yar-khan-liaquatpur', 28.6167, 70.25),
  ('Zahir Pir', 'rahim-yar-khan-zahir-pir', 28.4125, 70.2406)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'rahim-yar-khan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sahiwal Punjab (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Chichawatni', 'sahiwal-punjab-chichawatni', 30.53, 72.7),
  ('Harappa', 'sahiwal-punjab-harappa', 30.63, 72.88)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sahiwal-punjab'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kasur (Punjab) — 10 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Pattoki', 'kasur-pattoki', 31.0264, 73.8533),
  ('Kot Radha Kishan', 'kasur-kot-radha-kishan', 31.1711, 74.1064),
  ('Chunian', 'kasur-chunian', 30.9678, 73.9786),
  ('Phool Nagar', 'kasur-phool-nagar', 31.1667, 74.1667),
  ('Kanganpur', 'kasur-kanganpur', 30.8333, 74.3167),
  ('Mustafabad', 'kasur-mustafabad', 31.0062, 74.1395),
  ('Raja Jang', 'kasur-raja-jang', 31.2417, 74.125),
  ('Allahabad', 'kasur-allahabad', 30.7167, 73.8667),
  ('Khudian', 'kasur-khudian', 30.9489, 73.7433),
  ('Changa Manga', 'kasur-changa-manga', 31.0667, 73.9833)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kasur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Okara (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Depalpur', 'okara-depalpur', 30.67, 73.65),
  ('Basirpur', 'okara-basirpur', 30.5586, 73.8275),
  ('Renala Khurd', 'okara-renala-khurd', 30.8797, 73.5978)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'okara'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Jhang (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Shorkot', 'jhang-shorkot', 30.83, 72.1),
  ('Ahmadpur Sial', 'jhang-ahmadpur-sial', 30.6786, 71.8611)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'jhang'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Dera Ghazi Khan (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Taunsa Sharif', 'dera-ghazi-khan-taunsa-sharif', 30.7047, 70.6503),
  ('Fort Munro', 'dera-ghazi-khan-fort-munro', 30.92, 69.98)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'dera-ghazi-khan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Mianwali (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kalabagh', 'mianwali-kalabagh', 32.95, 71.55),
  ('Isa Khel', 'mianwali-isa-khel', 32.69, 71.27),
  ('Piplan', 'mianwali-piplan', 32.5333, 71.3667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mianwali'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Chiniot (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Lalian', 'chiniot-lalian', 31.7833, 72.8),
  ('Bhowana', 'chiniot-bhowana', 31.812, 72.744)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'chiniot'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Khanewal (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kabirwala', 'khanewal-kabirwala', 30.4028, 71.8694),
  ('Mian Channu', 'khanewal-mian-channu', 30.44, 72.354),
  ('Jahanian', 'khanewal-jahanian', 30.3086, 71.9736)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'khanewal'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Hafizabad (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Pindi Bhattian', 'hafizabad-pindi-bhattian', 31.8975, 73.2669),
  ('Sukheki', 'hafizabad-sukheki', 31.8333, 73.4333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'hafizabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Attock (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Hassan Abdal', 'attock-hassan-abdal', 33.8167, 72.4333),
  ('Hazro', 'attock-hazro', 33.9086, 72.5344),
  ('Fateh Jang', 'attock-fateh-jang', 33.5667, 72.6417),
  ('Pindi Gheb', 'attock-pindi-gheb', 33.2333, 72.2667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'attock'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Jhelum (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Dina', 'jhelum-dina', 32.8425, 73.5972),
  ('Sohawa', 'jhelum-sohawa', 32.9167, 73.4167),
  ('Pind Dadan Khan', 'jhelum-pind-dadan-khan', 32.5833, 73.0417)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'jhelum'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Chakwal (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Talagang', 'chakwal-talagang', 32.9333, 72.4167),
  ('Choa Saidan Shah', 'chakwal-choa-saidan-shah', 32.7167, 72.9833),
  ('Kallar Kahar', 'chakwal-kallar-kahar', 32.7833, 72.7083)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'chakwal'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Narowal (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Shakargarh', 'narowal-shakargarh', 32.2642, 75.16),
  ('Zafarwal', 'narowal-zafarwal', 32.3447, 74.8994)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'narowal'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Vehari (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Burewala', 'vehari-burewala', 30.1667, 72.6833),
  ('Mailsi', 'vehari-mailsi', 29.7975, 72.175)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'vehari'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Khushab (Punjab) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Jauharabad', 'khushab-jauharabad', 32.365, 72.282),
  ('Noorpur Thal', 'khushab-noorpur-thal', 32.3119, 71.8108),
  ('Quaidabad', 'khushab-quaidabad', 32.2917, 71.9667),
  ('Hadali', 'khushab-hadali', 32.5833, 72.35)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'khushab'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Pakpattan (Punjab) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Arifwala', 'pakpattan-arifwala', 30.29, 73.07)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'pakpattan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Toba Tek Singh (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Gojra', 'toba-tek-singh-gojra', 31.1492, 72.6822),
  ('Kamalia', 'toba-tek-singh-kamalia', 30.7267, 72.6436),
  ('Pir Mahal', 'toba-tek-singh-pir-mahal', 30.7667, 72.4333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'toba-tek-singh'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Nankana Sahib (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sangla Hill', 'nankana-sahib-sangla-hill', 31.6167, 73.3833),
  ('Shahkot', 'nankana-sahib-shahkot', 31.35, 73.7083)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'nankana-sahib'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Mandi Bahauddin (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Phalia', 'mandi-bahauddin-phalia', 32.4333, 73.5833),
  ('Malakwal', 'mandi-bahauddin-malakwal', 32.5542, 73.2111)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mandi-bahauddin'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Lodhran (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kehror Pacca', 'lodhran-kehror-pacca', 29.2864, 71.0764),
  ('Dunyapur', 'lodhran-dunyapur', 29.6833, 71.7333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'lodhran'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Muzaffargarh (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kot Addu', 'muzaffargarh-kot-addu', 30.4692, 70.9647),
  ('Alipur', 'muzaffargarh-alipur', 29.3833, 70.9167),
  ('Jatoi', 'muzaffargarh-jatoi', 29.4833, 70.85)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'muzaffargarh'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Layyah (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Karor Lal Esan', 'layyah-karor-lal-esan', 30.9631, 70.9108),
  ('Chaubara', 'layyah-chaubara', 31.2333, 71.0833)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'layyah'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Bhakkar (Punjab) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Darya Khan', 'bhakkar-darya-khan', 31.7872, 71.1108),
  ('Mankera', 'bhakkar-mankera', 31.3833, 71.3333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'bhakkar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Bahawalnagar (Punjab) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Haroonabad', 'bahawalnagar-haroonabad', 29.6125, 73.1428),
  ('Fort Abbas', 'bahawalnagar-fort-abbas', 29.1933, 72.8533),
  ('Chishtian', 'bahawalnagar-chishtian', 29.7986, 72.8561)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'bahawalnagar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- SINDH
-- ===========================================================================

-- ----- District: Karachi (Sindh) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Malir', 'karachi-malir', 24.8937, 67.2094),
  ('Korangi', 'karachi-korangi', 24.84, 67.135),
  ('Landhi', 'karachi-landhi', 24.8461, 67.1994),
  ('Gadap', 'karachi-gadap', 25.0142, 67.2661)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'karachi'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Hyderabad (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Latifabad', 'hyderabad-latifabad', 25.38, 68.37),
  ('Qasimabad', 'hyderabad-qasimabad', 25.39, 68.34)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'hyderabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sukkur (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Rohri', 'sukkur-rohri', 27.6931, 68.8897),
  ('Pano Aqil', 'sukkur-pano-aqil', 27.8728, 68.8311)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sukkur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Larkana (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Ratodero', 'larkana-ratodero', 27.8875, 68.2011),
  ('Naudero', 'larkana-naudero', 27.6611, 68.3606)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'larkana'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Nawabshah (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Daur', 'nawabshah-daur', 26.6611, 68.3128),
  ('Sakrand', 'nawabshah-sakrand', 26.6478, 68.3944),
  ('Bandhi', 'nawabshah-bandhi', 26.6092, 68.2225)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'nawabshah'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Mirpurkhas (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Digri', 'mirpurkhas-digri', 25.1617, 69.1072),
  ('Kot Ghulam Muhammad', 'mirpurkhas-kot-ghulam-muhammad', 25.2967, 69.3403),
  ('Jhuddo', 'mirpurkhas-jhuddo', 25.1056, 69.4519)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mirpurkhas'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Jacobabad (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Thul', 'jacobabad-thul', 28.2411, 68.7764),
  ('Garhi Khero', 'jacobabad-garhi-khero', 28.0833, 68.3667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'jacobabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Shikarpur (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Khanpur', 'shikarpur-khanpur', 27.8431, 68.6806),
  ('Garhi Yasin', 'shikarpur-garhi-yasin', 27.9067, 68.5114),
  ('Lakhi Ghulam Shah', 'shikarpur-lakhi-ghulam-shah', 28.0167, 68.6667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'shikarpur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Khairpur (Sindh) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kot Diji', 'khairpur-kot-diji', 27.3433, 68.7078),
  ('Kingri', 'khairpur-kingri', 27.0611, 68.7011),
  ('Thari Mirwah', 'khairpur-thari-mirwah', 27.1786, 68.8239),
  ('Sobho Dero', 'khairpur-sobho-dero', 27.3, 68.6611)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'khairpur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Sanghar (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tando Adam', 'sanghar-tando-adam', 25.7686, 68.6714),
  ('Shahdadpur', 'sanghar-shahdadpur', 25.9242, 68.6219),
  ('Sinjhoro', 'sanghar-sinjhoro', 26.0375, 68.8019)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'sanghar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Badin (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Matli', 'badin-matli', 25.0431, 68.6514),
  ('Tando Bago', 'badin-tando-bago', 24.7817, 68.9614),
  ('Golarchi', 'badin-golarchi', 24.8611, 68.9811)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'badin'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Thatta (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sujawal', 'thatta-sujawal', 24.5944, 68.3386),
  ('Mirpur Bathoro', 'thatta-mirpur-bathoro', 24.7333, 68.2667),
  ('Keti Bandar', 'thatta-keti-bandar', 24.1433, 67.4533)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'thatta'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Dadu (Sindh) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Mehar', 'dadu-mehar', 27.1792, 67.82),
  ('Khairpur Nathan Shah', 'dadu-khairpur-nathan-shah', 27.0819, 67.7336),
  ('Johi', 'dadu-johi', 26.97, 67.2114),
  ('Sehwan Sharif', 'dadu-sehwan-sharif', 26.4186, 67.8581)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'dadu'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Ghotki (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Mirpur Mathelo', 'ghotki-mirpur-mathelo', 28.0036, 69.5533),
  ('Ubauro', 'ghotki-ubauro', 28.2333, 69.7331)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'ghotki'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kashmore (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kandhkot', 'kashmore-kandhkot', 27.5844, 68.1989),
  ('Tangwani', 'kashmore-tangwani', 27.7833, 68.3167)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kashmore'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Tando Allahyar (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Nasarpur', 'tando-allahyar-nasarpur', 25.5167, 68.6167),
  ('Chamber', 'tando-allahyar-chamber', 25.4833, 68.7)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'tando-allahyar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Tando Muhammad Khan (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tando Ghulam Hyder', 'tando-muhammad-khan-tando-ghulam-hyder', 25.06, 68.7067),
  ('Bulri Shah Karim', 'tando-muhammad-khan-bulri-shah-karim', 24.89, 68.66)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'tando-muhammad-khan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Matiari (Sindh) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Hala', 'matiari-hala', 25.8033, 68.4864),
  ('Saeedabad', 'matiari-saeedabad', 25.7486, 68.6222)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'matiari'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Umerkot (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Samaro', 'umerkot-samaro', 25.33, 69.4017),
  ('Pithoro', 'umerkot-pithoro', 25.2136, 69.2786),
  ('Kunri', 'umerkot-kunri', 25.1536, 69.5797)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'umerkot'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Tharparkar (Sindh) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Nagarparkar', 'tharparkar-nagarparkar', 24.3467, 70.7736),
  ('Chachro', 'tharparkar-chachro', 25.1211, 70.2514),
  ('Diplo', 'tharparkar-diplo', 24.4669, 70.3775)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'tharparkar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kambar Shahdadkot (Sindh) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Qambar', 'kambar-shahdadkot-qambar', 27.5856, 67.9972),
  ('Shahdadkot', 'kambar-shahdadkot-shahdadkot', 27.8508, 67.9011),
  ('Miro Khan', 'kambar-shahdadkot-miro-khan', 27.7511, 67.7217),
  ('Warah', 'kambar-shahdadkot-warah', 27.6883, 67.8031)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kambar-shahdadkot'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- KHYBER PAKHTUNKHWA
-- ===========================================================================

-- ----- District: Peshawar (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Mattani', 'peshawar-mattani', 33.9928, 71.5386),
  ('Chamkani', 'peshawar-chamkani', 33.99, 71.6097)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'peshawar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Mardan (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Takht Bhai', 'mardan-takht-bhai', 34.2172, 72.0419),
  ('Katlang', 'mardan-katlang', 34.31, 72.1067)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mardan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Abbottabad (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Havelian', 'abbottabad-havelian', 34.0533, 73.1586)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'abbottabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Swat (Khyber Pakhtunkhwa) — 4 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Saidu Sharif', 'swat-saidu-sharif', 34.7433, 72.3583),
  ('Madyan', 'swat-madyan', 35.03, 72.5167),
  ('Kalam', 'swat-kalam', 35.4833, 72.5861),
  ('Matta', 'swat-matta', 34.95, 72.5181)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'swat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Dera Ismail Khan (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Paharpur', 'dera-ismail-khan-paharpur', 31.7717, 70.81),
  ('Kulachi', 'dera-ismail-khan-kulachi', 31.9367, 70.4917)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'dera-ismail-khan'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kohat (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Lachi', 'kohat-lachi', 33.3833, 71.1736)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kohat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Haripur (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Ghazi', 'haripur-ghazi', 33.9933, 72.6486)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'haripur'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Nowshera (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Pabbi', 'nowshera-pabbi', 34.0083, 71.7917),
  ('Jehangira', 'nowshera-jehangira', 33.9817, 72.2183)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'nowshera'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Charsadda (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tangi', 'charsadda-tangi', 34.2133, 71.6464)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'charsadda'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Mansehra (Khyber Pakhtunkhwa) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Balakot', 'mansehra-balakot', 34.5512, 73.3512),
  ('Oghi', 'mansehra-oghi', 34.5083, 73.0414),
  ('Baffa', 'mansehra-baffa', 34.4392, 73.2292)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mansehra'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Swabi (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Topi', 'swabi-topi', 34.0678, 72.4708),
  ('Lahor', 'swabi-lahor', 34.0611, 72.3417)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'swabi'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Buner (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Ambela', 'buner-ambela', 34.4639, 72.5342)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'buner'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Shangla (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Besham', 'shangla-besham', 34.9203, 72.8806),
  ('Chakesar', 'shangla-chakesar', 34.8667, 72.6833)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'shangla'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Lakki Marwat (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Naurang', 'lakki-marwat-naurang', 32.7336, 70.8125)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'lakki-marwat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Tank (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Jandola', 'tank-jandola', 32.3986, 70.1428)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'tank'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Hangu (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tall', 'hangu-tall', 33.6092, 71.1914),
  ('Thal', 'hangu-thal', 33.3667, 70.8833)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'hangu'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Karak (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Takht Nusrati', 'karak-takht-nusrati', 33.0917, 71.075),
  ('Banda Daud Shah', 'karak-banda-daud-shah', 32.95, 71.14)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'karak'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Chitral (Khyber Pakhtunkhwa) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Booni', 'chitral-booni', 36.0483, 72.5383),
  ('Mastuj', 'chitral-mastuj', 36.4761, 72.7683),
  ('Garam Chashma', 'chitral-garam-chashma', 36.3967, 71.7517)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'chitral'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Lower Dir (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Chakdara', 'lower-dir-chakdara', 34.6483, 72.0372),
  ('Munda', 'lower-dir-munda', 34.7483, 71.97)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'lower-dir'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Upper Dir (Khyber Pakhtunkhwa) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Wari', 'upper-dir-wari', 35.2083, 71.9017),
  ('Sheringal', 'upper-dir-sheringal', 35.0667, 72.0667)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'upper-dir'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Malakand (Khyber Pakhtunkhwa) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Dargai', 'malakand-dargai', 34.5072, 72.0242)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'malakand'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- BALOCHISTAN
-- ===========================================================================

-- ----- District: Quetta (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Kuchlak', 'quetta-kuchlak', 30.3922, 66.9536)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'quetta'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Turbat (Balochistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Mand', 'turbat-mand', 26.2967, 61.7528),
  ('Tump', 'turbat-tump', 26.1533, 61.8311)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'turbat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Khuzdar (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Wadh', 'khuzdar-wadh', 27.39, 66.7039)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'khuzdar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Gwadar (Balochistan) — 3 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Pasni', 'gwadar-pasni', 25.2631, 63.4686),
  ('Jiwani', 'gwadar-jiwani', 25.0489, 61.7458),
  ('Ormara', 'gwadar-ormara', 25.2117, 64.6336)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'gwadar'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Loralai (Balochistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Duki', 'loralai-duki', 30.1472, 68.5758),
  ('Mekhtar', 'loralai-mekhtar', 30.26, 68.44)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'loralai'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kalat (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Surab', 'kalat-surab', 28.4883, 66.3319)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kalat'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Lasbela (Balochistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Hub', 'lasbela-hub', 24.9981, 66.8294),
  ('Bela', 'lasbela-bela', 25.7833, 66.6833)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'lasbela'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Pishin (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Bostan', 'pishin-bostan', 30.38, 66.9728)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'pishin'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Killa Abdullah (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Gulistan', 'killa-abdullah-gulistan', 30.3592, 66.4689)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'killa-abdullah'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Killa Saifullah (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Muslim Bagh', 'killa-saifullah-muslim-bagh', 30.8333, 68.335)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'killa-saifullah'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Naseerabad (Balochistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tamboo', 'naseerabad-tamboo', 28.66, 68.4706),
  ('Chatter', 'naseerabad-chatter', 28.5833, 68.3167)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'naseerabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Jaffarabad (Balochistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Usta Muhammad', 'jaffarabad-usta-muhammad', 28.2625, 68.0478),
  ('Rojhan Jamali', 'jaffarabad-rojhan-jamali', 28.1833, 68.1333)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'jaffarabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Dera Bugti (Balochistan) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sui', 'dera-bugti-sui', 29.2683, 69.2394)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'dera-bugti'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- ISLAMABAD CAPITAL TERRITORY
-- ===========================================================================

-- ----- District: Islamabad (Islamabad Capital Territory) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Tarnol', 'islamabad-tarnol', 33.7117, 72.9014),
  ('Bhara Kahu', 'islamabad-bhara-kahu', 33.7697, 73.1483)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'islamabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'islamabad-capital-territory')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- GILGIT-BALTISTAN
-- ===========================================================================

-- ----- District: Gilgit (Gilgit-Baltistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Danyor', 'gilgit-danyor', 35.9214, 74.3742),
  ('Juglot', 'gilgit-juglot', 36.0667, 74.6167)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'gilgit'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'gilgit-baltistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Hunza (Gilgit-Baltistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Aliabad', 'hunza-aliabad', 36.3094, 74.5894),
  ('Gulmit', 'hunza-gulmit', 36.3894, 74.8606)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'hunza'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'gilgit-baltistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Diamer (Gilgit-Baltistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Darel', 'diamer-darel', 35.4667, 74.2833),
  ('Tangir', 'diamer-tangir', 35.3833, 74.1167)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'diamer'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'gilgit-baltistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Ghizer (Gilgit-Baltistan) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Gupis', 'ghizer-gupis', 36.1967, 73.7017),
  ('Yasin', 'ghizer-yasin', 36.4472, 73.2903)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'ghizer'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'gilgit-baltistan')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- AZAD JAMMU & KASHMIR
-- ===========================================================================

-- ----- District: Mirpur Ajk (Azad Jammu & Kashmir) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Dadyal', 'mirpur-ajk-dadyal', 33.2286, 73.9311),
  ('Chakswari', 'mirpur-ajk-chakswari', 33.2333, 73.8464)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'mirpur-ajk'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Rawalakot Poonch (Azad Jammu & Kashmir) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Hajirah', 'rawalakot-poonch-hajirah', 33.8942, 73.9522),
  ('Abbaspur', 'rawalakot-poonch-abbaspur', 33.8044, 73.95)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'rawalakot-poonch'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Kotli (Azad Jammu & Kashmir) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sehnsa', 'kotli-sehnsa', 33.5711, 73.8486),
  ('Fatehpur Thakiala', 'kotli-fatehpur-thakiala', 33.4917, 73.8542)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'kotli'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Bhimber (Azad Jammu & Kashmir) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Barnala', 'bhimber-barnala', 32.9025, 74.0203),
  ('Samahni', 'bhimber-samahni', 32.9667, 74.0167)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'bhimber'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Bagh (Azad Jammu & Kashmir) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Dhirkot', 'bagh-dhirkot', 33.9667, 73.7)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'bagh'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Neelum (Azad Jammu & Kashmir) — 2 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Sharda', 'neelum-sharda', 34.7706, 73.7469),
  ('Kel', 'neelum-kel', 34.8806, 74.1181)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'neelum'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ----- District: Hattian Bala (Azad Jammu & Kashmir) — 1 towns -----
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, v.name, v.slug, v.lat, v.lng
FROM districts d
CROSS JOIN (VALUES
  ('Chinari', 'hattian-bala-chinari', 34.0986, 73.805)
) AS v(name, slug, lat, lng)
WHERE d.slug = 'hattian-bala'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT (district_id, slug) DO NOTHING;

-- ===========================================================================
-- DONE. Kasur district now lists 11 selectable cities (Kasur + the 10
-- towns above); every other district keeps its main city plus the new
-- towns added here. The location selector needs no app change.
-- ===========================================================================

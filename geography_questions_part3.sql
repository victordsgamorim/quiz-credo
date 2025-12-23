-- geography_questions_part3.sql
-- Final 5 new geography questions (34 existing + 5 = 39 total)

-- Question 11: Largest island in the world
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: largest_island_in_world
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('largest_island_in_world', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the largest island in the world?'),
        (q_id, 'pt', 'Qual é a maior ilha do mundo?'),
        (q_id, 'es', '¿Cuál es la isla más grande del mundo?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', true)
    RETURNING id INTO opt_a_id;

    -- Option B
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', false)
    RETURNING id INTO opt_b_id;

    -- Option C
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', false)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Greenland'),
        (opt_a_id, 'pt', 'Groenlândia'),
        (opt_a_id, 'es', 'Groenlandia');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'New Guinea'),
        (opt_b_id, 'pt', 'Nova Guiné'),
        (opt_b_id, 'es', 'Nueva Guinea');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Borneo'),
        (opt_c_id, 'pt', 'Bornéu'),
        (opt_c_id, 'es', 'Borneo');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Madagascar'),
        (opt_d_id, 'pt', 'Madagáscar'),
        (opt_d_id, 'es', 'Madagascar');
END $$;

-- Question 12: Hottest desert in the world
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: hottest_desert_in_world
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('hottest_desert_in_world', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'Which is the hottest desert in the world?'),
        (q_id, 'pt', 'Qual é o deserto mais quente do mundo?'),
        (q_id, 'es', '¿Cuál es el desierto más caliente del mundo?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', false)
    RETURNING id INTO opt_a_id;

    -- Option B (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', true)
    RETURNING id INTO opt_b_id;

    -- Option C
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', false)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Sahara Desert'),
        (opt_a_id, 'pt', 'Deserto do Saara'),
        (opt_a_id, 'es', 'Desierto del Sahara');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Dasht-e Lut'),
        (opt_b_id, 'pt', 'Deserto de Lut'),
        (opt_b_id, 'es', 'Desierto de Lut');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Arabian Desert'),
        (opt_c_id, 'pt', 'Deserto da Arábia'),
        (opt_c_id, 'es', 'Desierto Arábigo');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Gobi Desert'),
        (opt_d_id, 'pt', 'Deserto de Gobi'),
        (opt_d_id, 'es', 'Desierto de Gobi');
END $$;

-- Question 13: Capital of Turkey
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: capital_of_turkey
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('capital_of_turkey', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the capital city of Turkey?'),
        (q_id, 'pt', 'Qual é a capital da Turquia?'),
        (q_id, 'es', '¿Cuál es la capital de Turquía?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', false)
    RETURNING id INTO opt_a_id;

    -- Option B (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', true)
    RETURNING id INTO opt_b_id;

    -- Option C
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', false)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Istanbul'),
        (opt_a_id, 'pt', 'Istambul'),
        (opt_a_id, 'es', 'Estambul');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Ankara'),
        (opt_b_id, 'pt', 'Ancara'),
        (opt_b_id, 'es', 'Ankara');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Izmir'),
        (opt_c_id, 'pt', 'Esmirna'),
        (opt_c_id, 'es', 'Esmirna');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Antalya'),
        (opt_d_id, 'pt', 'Antália'),
        (opt_d_id, 'es', 'Antalya');
END $$;

-- Question 14: Longest river in Europe
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: longest_river_in_europe
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('longest_river_in_europe', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the longest river in Europe?'),
        (q_id, 'pt', 'Qual é o rio mais longo da Europa?'),
        (q_id, 'es', '¿Cuál es el río más largo de Europa?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', true)
    RETURNING id INTO opt_a_id;

    -- Option B
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', false)
    RETURNING id INTO opt_b_id;

    -- Option C
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', false)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Volga River'),
        (opt_a_id, 'pt', 'Rio Volga'),
        (opt_a_id, 'es', 'Río Volga');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Danube River'),
        (opt_b_id, 'pt', 'Rio Danúbio'),
        (opt_b_id, 'es', 'Río Danubio');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Rhine River'),
        (opt_c_id, 'pt', 'Rio Reno'),
        (opt_c_id, 'es', 'Río Rin');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Dnieper River'),
        (opt_d_id, 'pt', 'Rio Dniepre'),
        (opt_d_id, 'es', 'Río Dniéper');
END $$;

-- Question 15: Country with the most time zones
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: country_with_most_time_zones
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('country_with_most_time_zones', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'Which country spans the most time zones?'),
        (q_id, 'pt', 'Qual país abrange o maior número de fusos horários?'),
        (q_id, 'es', '¿Qué país abarca más zonas horarias?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', false)
    RETURNING id INTO opt_a_id;

    -- Option B (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', true)
    RETURNING id INTO opt_b_id;

    -- Option C
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', false)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Russia'),
        (opt_a_id, 'pt', 'Rússia'),
        (opt_a_id, 'es', 'Rusia');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'France'),
        (opt_b_id, 'pt', 'França'),
        (opt_b_id, 'es', 'Francia');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'United States'),
        (opt_c_id, 'pt', 'Estados Unidos'),
        (opt_c_id, 'es', 'Estados Unidos');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'China'),
        (opt_d_id, 'pt', 'China'),
        (opt_d_id, 'es', 'China');
END $$;

SELECT 'Final 5 questions for geography category script generated' AS result;

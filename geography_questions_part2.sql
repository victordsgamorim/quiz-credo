-- geography_questions_part2.sql
-- 5 more new geography questions (29 existing + 5 = 34 total)

-- Question 6: Largest country in South America
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: largest_country_south_america
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('largest_country_south_america', 2)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'Which is the largest country in South America by area?'),
        (q_id, 'pt', 'Qual é o maior país da América do Sul em área?'),
        (q_id, 'es', '¿Cuál es el país más grande de América del Sur por área?');

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
        (opt_a_id, 'en', 'Brazil'),
        (opt_a_id, 'pt', 'Brasil'),
        (opt_a_id, 'es', 'Brasil');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Argentina'),
        (opt_b_id, 'pt', 'Argentina'),
        (opt_b_id, 'es', 'Argentina');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Peru'),
        (opt_c_id, 'pt', 'Peru'),
        (opt_c_id, 'es', 'Perú');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Colombia'),
        (opt_d_id, 'pt', 'Colômbia'),
        (opt_d_id, 'es', 'Colombia');
END $$;

-- Question 7: Deepest point in the ocean
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: deepest_point_in_ocean
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('deepest_point_in_ocean', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the deepest known point in the Earth''s oceans?'),
        (q_id, 'pt', 'Qual é o ponto mais profundo conhecido nos oceanos da Terra?'),
        (q_id, 'es', '¿Cuál es el punto más profundo conocido en los océanos de la Tierra?');

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
        (opt_a_id, 'en', 'Challenger Deep'),
        (opt_a_id, 'pt', 'Fossa das Marianas'),
        (opt_a_id, 'es', 'Fosa de las Marianas');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Puerto Rico Trench'),
        (opt_b_id, 'pt', 'Fossa de Porto Rico'),
        (opt_b_id, 'es', 'Fosa de Puerto Rico');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Java Trench'),
        (opt_c_id, 'pt', 'Fossa de Java'),
        (opt_c_id, 'es', 'Fosa de Java');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Tonga Trench'),
        (opt_d_id, 'pt', 'Fossa de Tonga'),
        (opt_d_id, 'es', 'Fosa de Tonga');
END $$;

-- Question 8: Largest freshwater lake by volume
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: largest_freshwater_lake_by_volume
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('largest_freshwater_lake_by_volume', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the largest freshwater lake in the world by volume?'),
        (q_id, 'pt', 'Qual é o maior lago de água doce do mundo em volume?'),
        (q_id, 'es', '¿Cuál es el lago de agua dulce más grande del mundo por volumen?');

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
        (opt_a_id, 'en', 'Lake Superior'),
        (opt_a_id, 'pt', 'Lago Superior'),
        (opt_a_id, 'es', 'Lago Superior');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Lake Baikal'),
        (opt_b_id, 'pt', 'Lago Baikal'),
        (opt_b_id, 'es', 'Lago Baikal');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Lake Victoria'),
        (opt_c_id, 'pt', 'Lago Vitória'),
        (opt_c_id, 'es', 'Lago Victoria');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Lake Michigan'),
        (opt_d_id, 'pt', 'Lago Michigan'),
        (opt_d_id, 'es', 'Lago Michigan');
END $$;

-- Question 9: Country with the longest coastline
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: country_with_longest_coastline
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('country_with_longest_coastline', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'Which country has the longest coastline in the world?'),
        (q_id, 'pt', 'Qual país tem a costa mais longa do mundo?'),
        (q_id, 'es', '¿Qué país tiene la costa más larga del mundo?');

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
        (opt_b_id, 'en', 'Canada'),
        (opt_b_id, 'pt', 'Canadá'),
        (opt_b_id, 'es', 'Canadá');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'United States'),
        (opt_c_id, 'pt', 'Estados Unidos'),
        (opt_c_id, 'es', 'Estados Unidos');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Australia'),
        (opt_d_id, 'pt', 'Austrália'),
        (opt_d_id, 'es', 'Australia');
END $$;

-- Question 10: Capital of Egypt
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: capital_of_egypt
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('capital_of_egypt', 2)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the capital city of Egypt?'),
        (q_id, 'pt', 'Qual é a capital do Egito?'),
        (q_id, 'es', '¿Cuál es la capital de Egipto?');

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
        (opt_a_id, 'en', 'Cairo'),
        (opt_a_id, 'pt', 'Cairo'),
        (opt_a_id, 'es', 'El Cairo');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Alexandria'),
        (opt_b_id, 'pt', 'Alexandria'),
        (opt_b_id, 'es', 'Alejandría');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Luxor'),
        (opt_c_id, 'pt', 'Luxor'),
        (opt_c_id, 'es', 'Luxor');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Giza'),
        (opt_d_id, 'pt', 'Gizé'),
        (opt_d_id, 'es', 'Guiza');
END $$;

SELECT '5 more questions for geography category script generated' AS result;

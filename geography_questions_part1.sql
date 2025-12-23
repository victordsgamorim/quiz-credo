-- geography_questions_part1.sql
-- 5 new geography questions (24 existing + 5 = 29 total)

-- Question 1: Capital of Argentina
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: capital_of_argentina
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('capital_of_argentina', 2)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the capital city of Argentina?'),
        (q_id, 'pt', 'Qual é a capital da Argentina?'),
        (q_id, 'es', '¿Cuál es la capital de Argentina?');

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
        (opt_a_id, 'en', 'Buenos Aires'),
        (opt_a_id, 'pt', 'Buenos Aires'),
        (opt_a_id, 'es', 'Buenos Aires');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Buenos Aires'),
        (opt_b_id, 'pt', 'Buenos Aires'),
        (opt_b_id, 'es', 'Buenos Aires');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Santiago'),
        (opt_c_id, 'pt', 'Santiago'),
        (opt_c_id, 'es', 'Santiago');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Lima'),
        (opt_d_id, 'pt', 'Lima'),
        (opt_d_id, 'es', 'Lima');
END $$;

-- Question 2: Largest lake in the world
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: largest_lake_in_world
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('largest_lake_in_world', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the largest lake in the world by surface area?'),
        (q_id, 'pt', 'Qual é o maior lago do mundo em área de superfície?'),
        (q_id, 'es', '¿Cuál es el lago más grande del mundo por superficie?');

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
        (opt_a_id, 'en', 'Caspian Sea'),
        (opt_a_id, 'pt', 'Mar Cáspio'),
        (opt_a_id, 'es', 'Mar Caspio');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Lake Superior'),
        (opt_b_id, 'pt', 'Lago Superior'),
        (opt_b_id, 'es', 'Lago Superior');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Lake Victoria'),
        (opt_c_id, 'pt', 'Lago Vitória'),
        (opt_c_id, 'es', 'Lago Victoria');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Lake Baikal'),
        (opt_d_id, 'pt', 'Lago Baikal'),
        (opt_d_id, 'es', 'Lago Baikal');
END $$;

-- Question 3: Country with the most islands
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: country_with_most_islands
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('country_with_most_islands', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'Which country has the most islands in the world?'),
        (q_id, 'pt', 'Qual país tem o maior número de ilhas no mundo?'),
        (q_id, 'es', '¿Qué país tiene más islas en el mundo?');

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
        (opt_a_id, 'en', 'Indonesia'),
        (opt_a_id, 'pt', 'Indonésia'),
        (opt_a_id, 'es', 'Indonesia');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Sweden'),
        (opt_b_id, 'pt', 'Suécia'),
        (opt_b_id, 'es', 'Suecia');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Philippines'),
        (opt_c_id, 'pt', 'Filipinas'),
        (opt_c_id, 'es', 'Filipinas');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Norway'),
        (opt_d_id, 'pt', 'Noruega'),
        (opt_d_id, 'es', 'Noruega');
END $$;

-- Question 4: Longest mountain range
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: longest_mountain_range
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('longest_mountain_range', 3)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the longest mountain range in the world?'),
        (q_id, 'pt', 'Qual é a cordilheira mais longa do mundo?'),
        (q_id, 'es', '¿Cuál es la cordillera más larga del mundo?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', false)
    RETURNING id INTO opt_a_id;

    -- Option B
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', false)
    RETURNING id INTO opt_b_id;

    -- Option C (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', true)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Himalayas'),
        (opt_a_id, 'pt', 'Himalaias'),
        (opt_a_id, 'es', 'Himalaya');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Rocky Mountains'),
        (opt_b_id, 'pt', 'Montanhas Rochosas'),
        (opt_b_id, 'es', 'Montañas Rocosas');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Andes'),
        (opt_c_id, 'pt', 'Andes'),
        (opt_c_id, 'es', 'Andes');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Alps'),
        (opt_d_id, 'pt', 'Alpes'),
        (opt_d_id, 'es', 'Alpes');
END $$;

-- Question 5: Capital of South Africa
DO $$
DECLARE
    q_id uuid;
    opt_a_id uuid;
    opt_b_id uuid;
    opt_c_id uuid;
    opt_d_id uuid;
BEGIN
    -- Question: capital_of_south_africa
    INSERT INTO quiz.questions (concept_id, difficulty)
    VALUES ('capital_of_south_africa', 4)
    RETURNING id INTO q_id;

    -- Question translations (English, Portuguese, Spanish)
    INSERT INTO quiz.question_translations (question_id, lang, text)
    VALUES
        (q_id, 'en', 'What is the capital city of South Africa?'),
        (q_id, 'pt', 'Qual é a capital da África do Sul?'),
        (q_id, 'es', '¿Cuál es la capital de Sudáfrica?');

    -- Question category (geography)
    INSERT INTO quiz.question_categories (question_id, category_id)
    VALUES (q_id, 'geography');

    -- Option A
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'a', false)
    RETURNING id INTO opt_a_id;

    -- Option B
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'b', false)
    RETURNING id INTO opt_b_id;

    -- Option C (correct)
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'c', true)
    RETURNING id INTO opt_c_id;

    -- Option D
    INSERT INTO quiz.options (question_id, option_key, is_correct)
    VALUES (q_id, 'd', false)
    RETURNING id INTO opt_d_id;

    -- Option A translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_a_id, 'en', 'Johannesburg'),
        (opt_a_id, 'pt', 'Johannesburgo'),
        (opt_a_id, 'es', 'Johannesburgo');

    -- Option B translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_b_id, 'en', 'Cape Town'),
        (opt_b_id, 'pt', 'Cidade do Cabo'),
        (opt_b_id, 'es', 'Ciudad del Cabo');

    -- Option C translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_c_id, 'en', 'Pretoria'),
        (opt_c_id, 'pt', 'Pretória'),
        (opt_c_id, 'es', 'Pretoria');

    -- Option D translations
    INSERT INTO quiz.option_translations (option_id, lang, text)
    VALUES
        (opt_d_id, 'en', 'Durban'),
        (opt_d_id, 'pt', 'Durban'),
        (opt_d_id, 'es', 'Durban');
END $$;

SELECT '5 questions for geography category script generated' AS result;

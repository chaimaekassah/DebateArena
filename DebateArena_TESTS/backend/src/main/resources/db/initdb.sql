-- 1. SUPPRIMER TOUTES LES TABLES (dans le bon ordre)
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS test CASCADE;
DROP TABLE IF EXISTS debat CASCADE;
DROP TABLE IF EXISTS sujet CASCADE;
DROP TABLE IF EXISTS password_reset_token CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS badge CASCADE;

-- 2. SUPPRIMER LES TYPES ENUM
DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS categorie_badge_enum CASCADE;
DROP TYPE IF EXISTS niveau_enum CASCADE;
DROP TYPE IF EXISTS categorie_sujet_enum CASCADE;

-- 3. RECRÉER LES TYPES ENUM (avec les bonnes valeurs)
CREATE TYPE role_enum AS ENUM ('UTILISATEUR', 'ADMIN', 'CHATBOT');
CREATE TYPE categorie_badge_enum AS ENUM ('OR', 'ARGENT', 'BRONZE');
-- CORRECTION ICI : INTERMEDIAIRE (avec I) pas INTERMEDIARE
CREATE TYPE niveau_enum AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT');
CREATE TYPE categorie_sujet_enum AS ENUM (
    'ART', 'POLITIQUE', 'CULTURE', 'INFORMATIQUE', 'TENDANCE',
    'INDUSTRIE', 'PHILOSOPHIE', 'SANTE', 'HISTOIRE', 'MUSIQUE'
);

-- 4. CRÉER LES TABLES DANS LE BON ORDRE
-- Table badge (sans dépendances)
CREATE TABLE badge (
                       id SERIAL PRIMARY KEY,
                       nom VARCHAR(100) NOT NULL,
                       description TEXT,
                       categorie categorie_badge_enum NOT NULL
);

-- Table utilisateur (dépend de badge)
CREATE TABLE utilisateur (
                             id SERIAL PRIMARY KEY,
                             nom VARCHAR(100) NOT NULL,
                             prenom VARCHAR(100) NOT NULL,
                             email VARCHAR(100) UNIQUE NOT NULL,
                             password TEXT NOT NULL,
                             role role_enum NOT NULL DEFAULT 'UTILISATEUR',
                             score INT NOT NULL DEFAULT 0,
                             id_badge INT REFERENCES badge(id) ON DELETE SET NULL,
                             imagePath VARCHAR(200) NOT NULL DEFAULT 'default.jpg'
);

-- Table sujet (sans dépendances)
CREATE TABLE sujet (
                       id SERIAL PRIMARY KEY,
                       titre VARCHAR(100) NOT NULL,
                       difficulte niveau_enum NOT NULL,
                       categorie categorie_sujet_enum NOT NULL
);

-- Table debat (dépend de sujet et utilisateur)
CREATE TABLE debat (
                       id SERIAL PRIMARY KEY,
                       date_debut TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       duree INT,
                       id_sujet INT NOT NULL REFERENCES sujet(id) ON DELETE CASCADE,
                       id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
                       choix_utilisateur VARCHAR(10) NOT NULL DEFAULT 'POUR'
);

-- Table test (dépend de debat)
CREATE TABLE test (
                      id SERIAL PRIMARY KEY,
                      id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
                      note INT CHECK (note >= 0 AND note <= 20)
);

-- Table message (dépend de debat et utilisateur)
CREATE TABLE message (
                         id SERIAL PRIMARY KEY,
                         contenu TEXT NOT NULL,
                         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
                         id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table password_reset_token
CREATE TABLE password_reset_token (
                                      id BIGSERIAL PRIMARY KEY,
                                      utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
                                      token VARCHAR(255) NOT NULL,
                                      expiration TIMESTAMP NOT NULL
);

-- 5. INSÉRER LES DONNÉES DANS LE BON ORDRE
-- 1. Badge d'abord
INSERT INTO badge (nom, description, categorie) VALUES
                                                    ('Pionnier du débat', 'Badge décerné aux premiers utilisateurs de la plateforme', 'OR'),
                                                    ('Assistant IA', 'Badge du chatbot assistant', 'OR');

-- 2. Utilisateurs
INSERT INTO utilisateur (nom, prenom, email, password, role, score, id_badge, imagePath) VALUES
                                                                                             -- ADMIN (mot de passe: adminpass123)
                                                                                             ('Dupont', 'Jean', 'jean.dupont@email.com', '$2a$10$.UoCZXZQIiVt.xhAds1R5ePB0VlzPIKodidieoTrGOfzKd06jeIjm', 'ADMIN', 150, 1, 'default.jpg'),

                                                                                             -- UTILISATEURS (mot de passe: userpass123)
                                                                                             ('Martin', 'Marie', 'marie.martin@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 75, 1, 'default.jpg'),
                                                                                             ('Bernard', 'Pierre', 'pierre.bernard@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 30, 1, 'default.jpg'),
                                                                                             ('Expert', 'Test', 'expert@debatearena.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 400, 1, 'default.jpg'), -- password: userpass123

                                                                                             -- CHATBOT (mot de passe: userpass123)
                                                                                             ('Chatbot', 'AI', 'chatbot@debatearena.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'CHATBOT', 9999, 2, 'chatbot.jpg');

-- 3. Sujets (ATTENTION : utiliser les mêmes valeurs que dans l'enum)
INSERT INTO sujet (titre, difficulte, categorie) VALUES
                                                     -- CORRECTION ICI : 'INTERMEDIAIRE' (même orthographe que dans l'enum)
                                                     ('L''intelligence artificielle dans l''art', 'INTERMEDIAIRE', 'ART'),
                                                     ('La politique environnementale en Europe', 'AVANCE', 'POLITIQUE'),
                                                     ('L''influence de la musique classique moderne', 'DEBUTANT', 'MUSIQUE'),
                                                     ('Les réseaux sociaux sont-ils néfastes pour la démocratie ?', 'INTERMEDIAIRE', 'POLITIQUE'),
                                                     ('Le télétravail : avantage ou inconvénient pour la productivité ?', 'DEBUTANT', 'INDUSTRIE');

-- 4. Débats (après sujets et utilisateurs)
INSERT INTO debat (date_debut, duree, id_sujet, id_utilisateur, choix_utilisateur) VALUES
                                                                                       (CURRENT_TIMESTAMP, 60, 1, 2, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '2 hours', 45, 2, 3, 'CONTRE'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '1 day', 90, 3, 2, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '3 days', 120, 4, 3, 'CONTRE');

-- 5. Tests (après débats)
INSERT INTO test (id_debat, note) VALUES
                                      (1, 15),
                                      (2, 18),
                                      (3, 12);

-- 6. Messages (après débats et utilisateurs)
INSERT INTO message (contenu, id_debat, id_utilisateur) VALUES
                                                            -- Débat 1 (IA dans l'art)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: L''intelligence artificielle dans l''art\nVous: POUR\nMoi: CONTRE\n\nPrêt à débattre ?', 1, 4),
                                                            ('Je pense que l''IA permet de créer des œuvres innovantes et uniques.', 1, 2),
                                                            ('C''est intéressant, mais l''IA ne peut pas ressentir d''émotions comme un artiste humain.', 1, 4),

                                                            -- Débat 2 (Politique environnementale)
                                                            ('**TEST**\n\nSujet: La politique environnementale en Europe\nVous: CONTRE\nMoi: POUR\n\nÀ vous de jouer !', 2, 4),
                                                            ('Les politiques environnementales européennes sont trop contraignantes pour les entreprises.', 2, 3),
                                                            ('Pourtant, elles sont nécessaires pour préserver notre planète pour les générations futures.', 2, 4),

                                                            -- Débat 3 (Musique classique)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: L''influence de la musique classique moderne\nVous: POUR\nMoi: CONTRE\n\nPrêt à débattre ?', 3, 4),
                                                            ('La musique classique influence encore énormément la musique moderne.', 3, 2),
                                                            ('Mais la musique moderne a développé son propre langage musical.', 3, 4),

                                                            -- Débat 4 (Réseaux sociaux)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: Les réseaux sociaux sont-ils néfastes pour la démocratie ?\nVous: CONTRE\nMoi: POUR\n\nPrêt à débattre ?', 4, 4),
                                                            ('Les réseaux sociaux permettent une meilleure circulation de l''information.', 4, 3),
                                                            ('Ils facilitent aussi la diffusion de fausses informations et la manipulation.', 4, 4);

-- 7. VÉRIFICATION
SELECT '=== UTILISATEURS ===' as info;
SELECT
    u.id,
    u.nom || ' ' || u.prenom as nom_complet,
    u.email,
    u.role,
    u.score,
    b.nom as badge
FROM utilisateur u
         LEFT JOIN badge b ON u.id_badge = b.id
ORDER BY u.id;

SELECT '=== SUJETS ===' as info;
SELECT id, titre, difficulte, categorie FROM sujet;

SELECT '=== DÉBATS ===' as info;
SELECT
    d.id,
    s.titre,
    u.nom || ' ' || u.prenom as utilisateur,
    d.choix_utilisateur,
    CASE WHEN t.id IS NOT NULL THEN 'TEST' ELSE 'ENTRAINEMENT' END as type,
    d.date_debut,
    d.duree || 's' as duree,
    t.note
FROM debat d
         JOIN sujet s ON d.id_sujet = s.id
         JOIN utilisateur u ON d.id_utilisateur = u.id
         LEFT JOIN test t ON t.id_debat = d.id
ORDER BY d.date_debut DESC;

SELECT '=== MESSAGES (5 derniers) ===' as info;
SELECT
    m.id,
    d.id as debat_id,
    u.nom || ' ' || u.prenom as auteur,
    LEFT(m.contenu, 50) || '...' as contenu_preview,
    m.timestamp
FROM message m
    JOIN debat d ON m.id_debat = d.id
    JOIN utilisateur u ON m.id_utilisateur = u.id
ORDER BY m.timestamp DESC
    LIMIT 5;
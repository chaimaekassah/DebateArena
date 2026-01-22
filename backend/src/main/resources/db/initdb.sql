-- ============================================
-- SCRIPT SQL COMPLET POUR DEBATEARENA
-- ============================================

-- 1. SUPPRIMER TOUTES LES TABLES (dans le bon ordre)
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS test CASCADE;
DROP TABLE IF EXISTS debat CASCADE;
DROP TABLE IF EXISTS sujet CASCADE;
DROP TABLE IF EXISTS password_reset_token CASCADE;
DROP TABLE IF EXISTS signalement CASCADE;
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

-- Table signalement avec VARCHAR (pas besoin de types ENUM PostgreSQL séparés)
CREATE TABLE signalement (
                             id BIGSERIAL PRIMARY KEY,
                             id_utilisateur BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
                             titre VARCHAR(200) NOT NULL,
                             description VARCHAR(2000) NOT NULL,
                             type_probleme VARCHAR(50) NOT NULL,
                             statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
                             date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             date_resolution TIMESTAMP,
                             id_admin_traitement BIGINT REFERENCES utilisateur(id) ON DELETE SET NULL,
                             commentaire_admin VARCHAR(1000),
                             id_debat BIGINT REFERENCES debat(id) ON DELETE SET NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_signalement_utilisateur ON signalement(id_utilisateur);
CREATE INDEX idx_signalement_statut ON signalement(statut);
CREATE INDEX idx_signalement_date_creation ON signalement(date_creation DESC);
CREATE INDEX idx_signalement_type ON signalement(type_probleme);

-- Index pour le dashboard admin
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_debat_date_debut ON debat(date_debut);
CREATE INDEX idx_debat_duree ON debat(duree);
CREATE INDEX idx_message_timestamp ON message(timestamp);
CREATE INDEX idx_test_note ON test(note);
CREATE INDEX idx_sujet_categorie ON sujet(categorie);
CREATE INDEX idx_sujet_difficulte ON sujet(difficulte);

-- 5. INSÉRER LES DONNÉES DANS LE BON ORDRE
-- 1. Badge d'abord
INSERT INTO badge (nom, description, categorie) VALUES
                                                    ('Pionnier du débat', 'Badge décerné aux premiers utilisateurs de la plateforme', 'OR'),
                                                    ('Assistant IA', 'Badge du chatbot assistant', 'OR'),
                                                    ('Nouveau Débatteur', 'Badge attribué aux nouveaux utilisateurs', 'BRONZE'),
                                                    ('Expert en argumentation', 'Badge décerné aux utilisateurs avancés', 'ARGENT');

-- 2. Utilisateurs
INSERT INTO utilisateur (nom, prenom, email, password, role, score, id_badge, imagePath) VALUES
                                                                                             -- ADMIN (mot de passe: adminpass123)
                                                                                             ('Dupont', 'Jean', 'jean.dupont@email.com', '$2a$10$.UoCZXZQIiVt.xhAds1R5ePB0VlzPIKodidieoTrGOfzKd06jeIjm', 'ADMIN', 150, 1, 'default.jpg'),

                                                                                             -- UTILISATEURS (mot de passe: userpass123)
                                                                                             ('Martin', 'Marie', 'marie.martin@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 75, 3, 'default.jpg'),
                                                                                             ('Bernard', 'Pierre', 'pierre.bernard@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 30, 3, 'default.jpg'),
                                                                                             ('Expert', 'Test', 'expert@debatearena.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 400, 4, 'default.jpg'),

                                                                                             -- CHATBOT (mot de passe: userpass123)
                                                                                             ('Chatbot', 'AI', 'chatbot@debatearena.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'CHATBOT', 9999, 2, 'chatbot.jpg');

-- 3. Sujets
INSERT INTO sujet (titre, difficulte, categorie) VALUES
                                                     ('L''intelligence artificielle dans l''art', 'INTERMEDIAIRE', 'ART'),
                                                     ('La politique environnementale en Europe', 'AVANCE', 'POLITIQUE'),
                                                     ('L''influence de la musique classique moderne', 'DEBUTANT', 'MUSIQUE'),
                                                     ('Les réseaux sociaux sont-ils néfastes pour la démocratie ?', 'INTERMEDIAIRE', 'POLITIQUE'),
                                                     ('Le télétravail : avantage ou inconvénient pour la productivité ?', 'DEBUTANT', 'INDUSTRIE'),
                                                     ('La conquête spatiale est-elle nécessaire ?', 'INTERMEDIAIRE', 'CULTURE'),
                                                     ('Le végétarisme comme mode de vie', 'DEBUTANT', 'SANTE'),
                                                     ('L''impact des réseaux sociaux sur la santé mentale', 'INTERMEDIAIRE', 'SANTE'),
                                                     ('L''avenir des cryptomonnaies', 'AVANCE', 'INFORMATIQUE'),
                                                     ('L''éducation doit-elle être gratuite ?', 'INTERMEDIAIRE', 'POLITIQUE');

-- 4. Débats (après sujets et utilisateurs)
INSERT INTO debat (date_debut, duree, id_sujet, id_utilisateur, choix_utilisateur) VALUES
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '5 days', 60, 1, 2, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '4 days', 45, 2, 3, 'CONTRE'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '3 days', 90, 3, 2, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '2 days', 120, 4, 3, 'CONTRE'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '1 day', 60, 5, 4, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL, 6, 2, 'POUR'), -- En cours
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL, 7, 3, 'CONTRE'), -- En cours
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '1 day', 75, 8, 4, 'POUR'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '2 days', 90, 9, 2, 'CONTRE'),
                                                                                       (CURRENT_TIMESTAMP - INTERVAL '4 days', 110, 10, 3, 'POUR');

-- 5. Tests (après débats)
INSERT INTO test (id_debat, note) VALUES
                                      (1, 15),
                                      (2, 18),
                                      (3, 12),
                                      (4, 16),
                                      (5, 14),
                                      (8, 17),
                                      (9, 19),
                                      (10, 13);

-- 6. Messages (après débats et utilisateurs)
INSERT INTO message (contenu, id_debat, id_utilisateur) VALUES
                                                            -- Débat 1 (IA dans l'art)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: L''intelligence artificielle dans l''art\nVous: POUR\nMoi: CONTRE\n\nPrêt à débattre ?', 1, 5),
                                                            ('Je pense que l''IA permet de créer des œuvres innovantes et uniques.', 1, 2),
                                                            ('C''est intéressant, mais l''IA ne peut pas ressentir d''émotions comme un artiste humain.', 1, 5),
                                                            ('Pourtant, l''IA peut analyser des milliers d''œuvres pour créer quelque chose de nouveau.', 1, 2),

                                                            -- Débat 2 (Politique environnementale)
                                                            ('**TEST**\n\nSujet: La politique environnementale en Europe\nVous: CONTRE\nMoi: POUR\n\nÀ vous de jouer !', 2, 5),
                                                            ('Les politiques environnementales européennes sont trop contraignantes pour les entreprises.', 2, 3),
                                                            ('Pourtant, elles sont nécessaires pour préserver notre planète pour les générations futures.', 2, 5),
                                                            ('Mais elles rendent l''Europe moins compétitive face à d''autres pays.', 2, 3),

                                                            -- Débat 3 (Musique classique)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: L''influence de la musique classique moderne\nVous: POUR\nMoi: CONTRE\n\nPrêt à débattre ?', 3, 5),
                                                            ('La musique classique influence encore énormément la musique moderne.', 3, 2),
                                                            ('Mais la musique moderne a développé son propre langage musical.', 3, 5),

                                                            -- Débat 4 (Réseaux sociaux)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: Les réseaux sociaux sont-ils néfastes pour la démocratie ?\nVous: CONTRE\nMoi: POUR\n\nPrêt à débattre ?', 4, 5),
                                                            ('Les réseaux sociaux permettent une meilleure circulation de l''information.', 4, 3),
                                                            ('Ils facilitent aussi la diffusion de fausses informations et la manipulation.', 4, 5),

                                                            -- Débat 5 (Télétravail)
                                                            ('**TEST**\n\nSujet: Le télétravail : avantage ou inconvénient pour la productivité ?\nVous: POUR\nMoi: CONTRE\n\nÀ vous de jouer !', 5, 5),
                                                            ('Le télétravail permet de réduire les temps de transport et d''être plus concentré.', 5, 4),
                                                            ('Mais il peut aussi diminuer la collaboration entre collègues.', 5, 5),

                                                            -- Débat 6 (En cours)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: La conquête spatiale est-elle nécessaire ?\nVous: POUR\nMoi: CONTRE\n\nPrêt à débattre ?', 6, 5),
                                                            ('La conquête spatiale est essentielle pour l''avenir de l''humanité.', 6, 2),

                                                            -- Débat 7 (En cours)
                                                            ('**ENTRAÎNEMENT**\n\nSujet: Le végétarisme comme mode de vie\nVous: CONTRE\nMoi: POUR\n\nPrêt à débattre ?', 7, 5),
                                                            ('Le végétarisme a des impacts positifs sur la santé et l''environnement.', 7, 3);

-- 7. Signalements (pour tester les fonctionnalités admin)
INSERT INTO signalement (id_utilisateur, titre, description, type_probleme, statut, date_creation, date_resolution, id_admin_traitement, commentaire_admin) VALUES
                                                                                                                                                                -- Signalement EN_ATTENTE
                                                                                                                                                                (2, 'Bug dans l''interface de débat', 'Lorsque je clique sur "Terminer le débat", rien ne se passe. Le bouton semble bloqué.', 'BUG_TECHNIQUE', 'EN_ATTENTE', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, NULL, NULL),

                                                                                                                                                                -- Signalement EN_COURS
                                                                                                                                                                (3, 'Contenu inapproprié', 'Un utilisateur a utilisé un langage offensant dans un débat sur les réseaux sociaux.', 'CONTENU_INAPPROPRIE', 'EN_COURS', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 1, 'Signalement en cours d''investigation'),

                                                                                                                                                                -- Signalement RESOLU
                                                                                                                                                                (2, 'Suggestion d''amélioration', 'Pourriez-vous ajouter plus de sujets sur la technologie et l''intelligence artificielle ?', 'SUGGESTION', 'RESOLU', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days', 1, 'Merci pour la suggestion ! Nous ajouterons plus de sujets technologiques dans les prochaines semaines.'),

                                                                                                                                                                -- Signalement REJETE
                                                                                                                                                                (4, 'Problème avec le chatbot', 'Le chatbot ne répond pas correctement aux arguments complexes.', 'PROBLEME_CHATBOT', 'REJETE', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 1, 'Le chatbot est conçu pour un niveau intermédiaire. Pour des débats complexes, nous recommandons de choisir un sujet de difficulté "Expert".'),

                                                                                                                                                                -- Plus de signalements pour les tests
                                                                                                                                                                (3, 'Interface trop lente', 'L''interface de chat met plusieurs secondes à répondre parfois.', 'BUG_TECHNIQUE', 'EN_ATTENTE', CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL, NULL, NULL),
                                                                                                                                                                (2, 'Sujet manquant', 'Il manque des sujets sur l''écologie et le développement durable.', 'SUGGESTION', 'EN_ATTENTE', CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, NULL, NULL),
                                                                                                                                                                (4, 'Problème de connexion', 'Je suis parfois déconnecté pendant un débat.', 'BUG_TECHNIQUE', 'EN_COURS', CURRENT_TIMESTAMP - INTERVAL '12 hours', NULL, 1, 'Nous investiguons les problèmes de connexion');

-- 8. VÉRIFICATION DES DONNÉES
DO $$
BEGIN
    RAISE NOTICE '=== BASE DE DONNÉES DEBATEARENA INITIALISÉE AVEC SUCCÈS ===';
    RAISE NOTICE 'Date d''exécution: %', CURRENT_TIMESTAMP;
END $$;

-- 9. STATISTIQUES (pour vérifier)
SELECT '=== STATISTIQUES GLOBALES ===' as info;
SELECT
    (SELECT COUNT(*) FROM utilisateur WHERE role = 'UTILISATEUR') as total_utilisateurs,
    (SELECT COUNT(*) FROM utilisateur WHERE role = 'ADMIN') as total_admins,
    (SELECT COUNT(*) FROM debat) as total_debats,
    (SELECT COUNT(*) FROM debat WHERE duree IS NULL) as debats_en_cours,
    (SELECT COUNT(*) FROM sujet) as total_sujets,
    (SELECT COUNT(*) FROM test) as total_tests,
    (SELECT COUNT(*) FROM message) as total_messages,
    (SELECT COUNT(*) FROM signalement) as total_signalements,
    (SELECT COUNT(*) FROM signalement WHERE statut = 'EN_ATTENTE') as signalements_en_attente;

-- 10. VÉRIFICATION DES DONNÉES IMPORTANTES
SELECT '=== UTILISATEURS ADMIN ===' as info;
SELECT id, nom, prenom, email, role FROM utilisateur WHERE role = 'ADMIN';

SELECT '=== SIGNALEMENTS POUR TESTS ===' as info;
SELECT
    s.id,
    u.nom || ' ' || u.prenom as utilisateur,
    s.titre,
    s.type_probleme,
    s.statut,
    s.date_creation
FROM signalement s
         JOIN utilisateur u ON s.id_utilisateur = u.id
ORDER BY s.date_creation DESC;

SELECT '=== SUJETS DISPONIBLES ===' as info;
SELECT id, titre, difficulte, categorie FROM sujet ORDER BY categorie, difficulte;

-- 11. VÉRIFICATION DES INDEX
SELECT '=== INDEX CRÉÉS ===' as info;
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('signalement', 'debat', 'message', 'utilisateur', 'sujet')
ORDER BY tablename, indexname;
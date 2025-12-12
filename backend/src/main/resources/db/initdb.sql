-- Création des types énumérés
CREATE TYPE role_enum AS ENUM ('UTILISATEUR','ADMIN');

CREATE TYPE categorie_badge_enum AS ENUM ('OR', 'ARGENT', 'BRONZE');

CREATE TYPE niveau_enum AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT');

CREATE TYPE categorie_sujet_enum AS ENUM (
    'ART', 'POLITIQUE', 'CULTURE', 'INFORMATIQUE', 'TENDANCE',
    'INDUSTRIE', 'PHILOSOPHIE', 'SANTE', 'HISTOIRE', 'MUSIQUE'
);

-- Table badge
CREATE TABLE badge (
                       id SERIAL PRIMARY KEY,
                       nom VARCHAR(100) NOT NULL,
                       description TEXT,
                       categorie categorie_badge_enum NOT NULL
);

-- Table utilisateur (version corrigée)
CREATE TABLE utilisateur (
                             id SERIAL PRIMARY KEY,
                             nom VARCHAR(100) NOT NULL,
                             prenom VARCHAR(100) NOT NULL,
                             email VARCHAR(100) UNIQUE NOT NULL,
                             password TEXT NOT NULL,
                             role role_enum NOT NULL DEFAULT 'UTILISATEUR',
                             score INT NOT NULL DEFAULT 0,
                             id_badge INT DEFAULT NULL REFERENCES badge(id) ON DELETE SET NULL
);

-- Table sujet
CREATE TABLE sujet (
                       id SERIAL PRIMARY KEY,
                       titre VARCHAR(100) NOT NULL,
                       difficulte niveau_enum NOT NULL,
                       categorie categorie_sujet_enum NOT NULL
);

-- Table debat
CREATE TABLE debat (
                       id SERIAL PRIMARY KEY,
                       date_debut TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       duree INT,
                       id_sujet INT NOT NULL REFERENCES sujet(id) ON DELETE CASCADE,
                       id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table test
CREATE TABLE test (
                      id SERIAL PRIMARY KEY,
                      id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
                      note INT CHECK (note >= 0 AND note <= 20)
);

-- Table message
CREATE TABLE message (
                         id SERIAL PRIMARY KEY,
                         contenu TEXT NOT NULL,
                         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
                         id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Insertion d'un seul badge
INSERT INTO badge (nom, description, categorie) VALUES
    ('Pionnier du débat', 'Badge décerné aux premiers utilisateurs de la plateforme', 'OR');


INSERT INTO utilisateur (nom, prenom, email, password, role, score, id_badge) VALUES
                                                                                  ('Dupont', 'Jean', 'jean.dupont@email.com', '$2a$10$.UoCZXZQIiVt.xhAds1R5ePB0VlzPIKodidieoTrGOfzKd06jeIjm', 'ADMIN', 0, 1), -- adminpass123
                                                                                  ('Martin', 'Marie', 'marie.martin@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Bernard', 'Pierre', 'pierre.bernard@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Thomas', 'Sophie', 'sophie.thomas@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Petit', 'Lucas', 'lucas.petit@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Robert', 'Julie', 'julie.robert@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Richard', 'Paul', 'paul.richard@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Durand', 'Anna', 'anna.durand@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Leroy', 'Marc', 'marc.leroy@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1), -- userpass123
                                                                                  ('Moreau', 'Sarah', 'sarah.moreau@email.com', '$2a$10$a/9XmOiP.Gtw2ePZDIY9lO3xlhgBj8pCeEwWpQOtTkI2mh8H.6sTS', 'UTILISATEUR', 0, 1); -- userpass123

-- Insertion de quelques sujets
INSERT INTO sujet (titre, difficulte, categorie) VALUES
                                                     ('L''intelligence artificielle dans l''art', 'INTERMEDIAIRE', 'ART'),
                                                     ('La politique environnementale en Europe', 'AVANCE', 'POLITIQUE'),
                                                     ('L''influence de la musique classique moderne', 'DEBUTANT', 'MUSIQUE'),
                                                     ('Les enjeux de la cybersécurité', 'EXPERT', 'INFORMATIQUE'),
                                                     ('La philosophie du stoïcisme aujourd''hui', 'INTERMEDIAIRE', 'PHILOSOPHIE');

-- Insertion de quelques débats
INSERT INTO debat (date_debut, duree, id_sujet, id_utilisateur) VALUES
                                                                    (CURRENT_TIMESTAMP, 60, 1, 1),
                                                                    (CURRENT_TIMESTAMP - INTERVAL '2 hours', 45, 2, 2),
                                                                    (CURRENT_TIMESTAMP - INTERVAL '1 day', 90, 3, 3);

-- Insertion de quelques tests
INSERT INTO test (id_debat, note) VALUES
                                      (1, 15),
                                      (2, 18),
                                      (3, 12);

-- Insertion de quelques messages
INSERT INTO message (contenu, id_debat, id_utilisateur) VALUES
                                                            ('Je pense que l''IA ouvre de nouvelles perspectives créatives.', 1, 1),
                                                            ('Mais elle risque de dévaloriser le travail humain.', 1, 2),
                                                            ('La politique environnementale doit être plus ambitieuse.', 2, 3),
                                                            ('La musique classique influence encore beaucoup de genres modernes.', 3, 4);

-- Exemple de requête pour vérifier les données
SELECT
    u.nom,
    u.prenom,
    u.score,
    b.nom as badge_nom,
    b.categorie as badge_categorie
FROM utilisateur u
         LEFT JOIN badge b ON u.id_badge = b.id
ORDER BY u.score DESC;
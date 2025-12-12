CREATE TYPE role_enum AS ENUM ('UTILISATEUR','ADMIN');

CREATE TYPE categorie_badge_enum AS ENUM ('OR', 'ARGENT', 'BRONZE');

CREATE TYPE niveau_enum AS ENUM ('DEBUTANT', 'INTERMEDIARE', 'AVANCE', 'EXPERT');

CREATE TYPE categorie_sujet_enum AS ENUM (
                                        'ART', 'POLITIQUE', 'CULTURE', 'INFORMATIQUE', 'TENDANCE',
                                        'INDUSTRIE', 'PHILOSOPHIE', 'SANTE', 'HISTOIRE', 'MUSIQUE'
                                        );

CREATE TABLE badge (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    categorie categorie_badge_enum NOT NULL
);

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

CREATE TABLE sujet (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    difficulte niveau_enum NOT NULL,
    categorie categorie_sujet_enum NOT NULL
    );

CREATE TABLE debat (
    id SERIAL PRIMARY KEY,
    date_debut TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duree INT,
    id_sujet INT NOT NULL REFERENCES sujet(id) ON DELETE CASCADE,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
    note INT CHECK (note >= 0 AND note <= 20)
);


CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_debat INT NOT NULL REFERENCES debat(id) ON DELETE CASCADE,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);


DELETE FROM message;
DELETE FROM test;
DELETE FROM debat;
DELETE FROM sujet;
DELETE FROM utilisateur;
DELETE FROM badge;

-- Réinitialise les séquences
ALTER SEQUENCE badge_id_seq RESTART WITH 1;
ALTER SEQUENCE utilisateur_id_seq RESTART WITH 1;
ALTER SEQUENCE sujet_id_seq RESTART WITH 1;
ALTER SEQUENCE debat_id_seq RESTART WITH 1;
ALTER SEQUENCE test_id_seq RESTART WITH 1;
ALTER SEQUENCE message_id_seq RESTART WITH 1;

-- 1. Insérer UN SEUL badge (optionnel pour l'auth)
INSERT INTO badge (nom, description, categorie) VALUES
    ('Badge Débutant', 'Premier badge obtenu', 'BRONZE');

-- 2. Insérer seulement 3 utilisateurs pour l'authentification
-- Note: En production, utilise bcrypt pour les mots de passe !
INSERT INTO utilisateur (nom, prenom, email, password, role, score, id_badge) VALUES
                                                                                  ('Admin', 'System', 'admin@debattle.com', 'admin123', 'ADMIN', 100, 1),
                                                                                  ('Dupont', 'Jean', 'jean@test.com', 'user123', 'UTILISATEUR', 50, 1),
                                                                                  ('Martin', 'Marie', 'marie@test.com', 'user456', 'UTILISATEUR', 75, 1);
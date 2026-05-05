-- =============================================
--  Safari Alpha — banco.sql
--  Execute este script uma vez para criar o BD
-- =============================================

CREATE DATABASE IF NOT EXISTS safari_alpha
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE safari_alpha;

-- ---- Tabela de Exploradores ----
CREATE TABLE IF NOT EXISTS exploradores (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(80)     NOT NULL,
  emoji       VARCHAR(10)     NOT NULL DEFAULT '👦',
  senha_json  JSON            NOT NULL COMMENT 'Array com 3 emojis de animais',
  moedas      INT UNSIGNED    NOT NULL DEFAULT 0,
  criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Tabela de Progresso por Fase ----
CREATE TABLE IF NOT EXISTS progresso (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  explorer_id  INT UNSIGNED   NOT NULL,
  secao        VARCHAR(40)    NOT NULL COMMENT 'fazendinha | floresta | savana | mar',
  fase         TINYINT        NOT NULL,
  estrelas     TINYINT        NOT NULL DEFAULT 0 COMMENT '0-3',
  concluido_em DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_explorer_secao_fase (explorer_id, secao, fase),
  CONSTRAINT fk_progresso_explorer
    FOREIGN KEY (explorer_id) REFERENCES exploradores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Tabela de Logins ----
CREATE TABLE IF NOT EXISTS logins (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  explorer_id  INT UNSIGNED   NOT NULL,
  data_login   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_logins_explorer
    FOREIGN KEY (explorer_id) REFERENCES exploradores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
--  DADOS INICIAIS (exploradores de exemplo)
-- =============================================

INSERT INTO exploradores (nome, emoji, senha_json, moedas) VALUES
  ('Ana',   '👧',   '["🦁","🐘","🐒"]', 24),
  ('Pedro', '👦',   '["🦒","🦓","🐯"]', 10),
  ('Luna',  '👧🏾', '["🐼","🐨","🐰"]',  5),
  ('Danto', '👦🏻', '["🐊","🦊","🐻"]',  0);

-- Progresso da Ana (3 fases concluídas na Fazendinha)
INSERT INTO progresso (explorer_id, secao, fase, estrelas) VALUES
  (1, 'fazendinha', 1, 3),
  (1, 'fazendinha', 2, 3),
  (1, 'floresta',   1, 1);

-- Progresso do Pedro (1 fase na Fazendinha)
INSERT INTO progresso (explorer_id, secao, fase, estrelas) VALUES
  (2, 'fazendinha', 1, 2);

-- =============================================
--  VIEW: ranking geral
-- =============================================
CREATE OR REPLACE VIEW vw_ranking AS
SELECT
  e.id,
  e.nome,
  e.emoji,
  e.moedas,
  COUNT(p.id)        AS fases_concluidas,
  SUM(p.estrelas)    AS total_estrelas
FROM exploradores e
LEFT JOIN progresso p ON p.explorer_id = e.id
GROUP BY e.id
ORDER BY e.moedas DESC;
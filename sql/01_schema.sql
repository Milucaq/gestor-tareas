-- =====================================================================
-- Sistema de Gestion de Tareas y Proyectos - Esquema Relacional (MySQL)
-- Practica Calificada 2 - Tecnologias Emergentes
-- =====================================================================
-- Modelo relacional: 3 entidades principales + 1 tabla puente (N:M)
--   usuarios          -> personas que usan el sistema
--   proyectos         -> proyectos internos de la startup
--   tareas            -> tareas asociadas a un proyecto y un responsable
--   proyecto_usuario  -> equipo de cada proyecto (relacion muchos-a-muchos)
-- =====================================================================

DROP DATABASE IF EXISTS gestor_tareas;
CREATE DATABASE gestor_tareas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE gestor_tareas;

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)        NOT NULL,
    email           VARCHAR(150)        NOT NULL UNIQUE,
    rol             ENUM('admin','scrum_master','desarrollador','tester') 
                                        NOT NULL DEFAULT 'desarrollador',
    fecha_registro  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: proyectos
--   responsable_id -> clave foranea hacia usuarios (dueno/lider del proyecto)
-- ---------------------------------------------------------------------
CREATE TABLE proyectos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150)        NOT NULL,
    descripcion     TEXT,
    fecha_inicio    DATE,
    fecha_fin       DATE,
    estado          ENUM('activo','pausado','finalizado') 
                                        NOT NULL DEFAULT 'activo',
    responsable_id  INT,
    CONSTRAINT fk_proyecto_responsable
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: tareas
--   proyecto_id    -> clave foranea hacia proyectos (1 proyecto : N tareas)
--   responsable_id -> clave foranea hacia usuarios  (1 usuario  : N tareas)
--   estado         -> refleja las columnas del tablero Kanban
-- ---------------------------------------------------------------------
CREATE TABLE tareas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    titulo          VARCHAR(200)        NOT NULL,
    descripcion     TEXT,
    estado          ENUM('pendiente','en_proceso','en_revision','finalizado')
                                        NOT NULL DEFAULT 'pendiente',
    prioridad       ENUM('baja','media','alta') NOT NULL DEFAULT 'media',
    proyecto_id     INT                 NOT NULL,
    responsable_id  INT,
    fecha_creacion  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_limite    DATE,
    CONSTRAINT fk_tarea_proyecto
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tarea_responsable
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla puente: proyecto_usuario (equipo del proyecto, relacion N:M)
-- ---------------------------------------------------------------------
CREATE TABLE proyecto_usuario (
    proyecto_id     INT NOT NULL,
    usuario_id      INT NOT NULL,
    PRIMARY KEY (proyecto_id, usuario_id),
    CONSTRAINT fk_pu_proyecto
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT fk_pu_usuario
        FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- INDICES (requisito: al menos un indice en MySQL)
-- =====================================================================
-- Indice sobre el estado de las tareas: acelera el filtrado por columna
-- del tablero Kanban (consulta muy frecuente en este sistema).
CREATE INDEX idx_tareas_estado     ON tareas(estado);

-- Indices adicionales sobre las claves foraneas mas consultadas.
CREATE INDEX idx_tareas_proyecto   ON tareas(proyecto_id);
CREATE INDEX idx_tareas_responsable ON tareas(responsable_id);

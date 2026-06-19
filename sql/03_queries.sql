-- =====================================================================
-- Consultas SQL requeridas: SELECT, JOIN, GROUP BY, ORDER BY
-- =====================================================================
USE gestor_tareas;

-- ---------------------------------------------------------------------
-- 1) SELECT simple con filtro (WHERE)
--    Listar todas las tareas que estan pendientes.
-- ---------------------------------------------------------------------
SELECT id, titulo, prioridad, fecha_limite
FROM tareas
WHERE estado = 'pendiente';

-- ---------------------------------------------------------------------
-- 2) JOIN entre 3 tablas
--    Mostrar cada tarea con el nombre del proyecto y de su responsable.
-- ---------------------------------------------------------------------
SELECT  t.id,
        t.titulo,
        t.estado,
        p.nombre  AS proyecto,
        u.nombre  AS responsable
FROM    tareas    t
JOIN    proyectos p ON t.proyecto_id    = p.id
LEFT JOIN usuarios u ON t.responsable_id = u.id;

-- ---------------------------------------------------------------------
-- 3) GROUP BY con funcion de agregacion
--    Contar cuantas tareas hay en cada estado del tablero Kanban.
-- ---------------------------------------------------------------------
SELECT  estado,
        COUNT(*) AS total_tareas
FROM    tareas
GROUP BY estado;

-- ---------------------------------------------------------------------
-- 3b) GROUP BY combinado con JOIN
--     Numero de tareas por proyecto.
-- ---------------------------------------------------------------------
SELECT  p.nombre               AS proyecto,
        COUNT(t.id)            AS total_tareas
FROM    proyectos p
LEFT JOIN tareas  t ON t.proyecto_id = p.id
GROUP BY p.id, p.nombre;

-- ---------------------------------------------------------------------
-- 4) ORDER BY
--    Listar tareas de mayor a menor prioridad y luego por fecha limite.
-- ---------------------------------------------------------------------
SELECT  titulo, prioridad, fecha_limite, estado
FROM    tareas
ORDER BY FIELD(prioridad,'alta','media','baja') ASC,
         fecha_limite ASC;

-- ---------------------------------------------------------------------
-- 5) Consulta integradora (JOIN + GROUP BY + ORDER BY)
--    Carga de trabajo: tareas asignadas a cada usuario, ordenado desc.
-- ---------------------------------------------------------------------
SELECT  u.nombre              AS responsable,
        COUNT(t.id)           AS tareas_asignadas
FROM    usuarios u
LEFT JOIN tareas t ON t.responsable_id = u.id
GROUP BY u.id, u.nombre
ORDER BY tareas_asignadas DESC;

-- ---------------------------------------------------------------------
-- Verificar uso del indice (EXPLAIN sobre el filtro por estado)
-- ---------------------------------------------------------------------
EXPLAIN SELECT * FROM tareas WHERE estado = 'en_proceso';

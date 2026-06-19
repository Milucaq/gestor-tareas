-- =====================================================================
-- Datos de prueba (seed) para el sistema de gestion de tareas
-- =====================================================================
USE gestor_tareas;

INSERT INTO usuarios (nombre, email, rol) VALUES
('Ana Torres',    'ana.torres@startup.com',    'scrum_master'),
('Luis Ramirez',  'luis.ramirez@startup.com',  'desarrollador'),
('Maria Quispe',  'maria.quispe@startup.com',  'desarrollador'),
('Carlos Mendoza','carlos.mendoza@startup.com','tester'),
('Sofia Leon',    'sofia.leon@startup.com',    'admin');

INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado, responsable_id) VALUES
('Sistema de Gestion Interna', 'Plataforma web para gestionar tareas y proyectos de la startup', '2026-06-01', '2026-08-30', 'activo', 1),
('Portal de Clientes',         'Portal para que los clientes consulten el avance de sus pedidos', '2026-07-01', '2026-09-15', 'activo', 5);

INSERT INTO proyecto_usuario (proyecto_id, usuario_id) VALUES
(1,1),(1,2),(1,3),(1,4),
(2,2),(2,5);

INSERT INTO tareas (titulo, descripcion, estado, prioridad, proyecto_id, responsable_id, fecha_limite) VALUES
('Disenar modelo de base de datos', 'Crear el modelo entidad-relacion del sistema', 'finalizado',  'alta',  1, 2, '2026-06-10'),
('Configurar entorno Docker',       'Levantar contenedores de MySQL y MongoDB',      'finalizado',  'alta',  1, 3, '2026-06-12'),
('Crear API de proyectos',          'Endpoints CRUD para proyectos',                 'en_revision', 'alta',  1, 2, '2026-06-20'),
('Crear API de tareas',             'Endpoints CRUD para tareas',                    'en_proceso',  'alta',  1, 3, '2026-06-22'),
('Disenar tablero Kanban en UI',    'Vista de columnas Kanban en React',             'en_proceso',  'media', 1, 2, '2026-06-25'),
('Pruebas de integracion API',      'Validar endpoints con casos de prueba',         'pendiente',   'media', 1, 4, '2026-06-28'),
('Login de clientes',               'Autenticacion del portal de clientes',          'pendiente',   'alta',  2, 2, '2026-07-10'),
('Maquetar dashboard de cliente',   'Vista principal del portal',                    'pendiente',   'baja',  2, 5, '2026-07-15');

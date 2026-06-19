# Gestor de Tareas y Proyectos

Sistema web full-stack para la gestion de tareas y proyectos internos de una startup.
Proyecto integrador de la Practica Calificada 2 - Tecnologias Emergentes.

## Tecnologias

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos relacional:** MySQL 8
- **Base de datos NoSQL:** MongoDB (Atlas o local)
- **Control de versiones y despliegue:** Git + GitHub (GitHub Pages + GitHub Actions)
- **Metodologias:** Scrum + Kanban (tablero en Trello)

## Estructura

```
gestor-tareas/
├── .github/workflows/   # Workflow de despliegue en GitHub Pages
├── sql/                 # Scripts SQL (esquema, datos, consultas)
├── mongodb/             # Operaciones MongoDB
├── backend/             # API REST (Node.js/Express)
├── frontend/            # App React (Kanban + formularios CRUD)
└── README.md
```

## 1. Preparar las bases de datos

- **MySQL:** instalar MySQL Community Server (o XAMPP) y ejecutar, en orden, los
  scripts de la carpeta `sql/`: `01_schema.sql`, `02_seed.sql`, `03_queries.sql`.
- **MongoDB:** crear un cluster gratuito en MongoDB Atlas (o instalar MongoDB local)
  y copiar la cadena de conexion.

## 2. Ejecutar el backend (local)

```bash
cd backend
npm install
# Configurar las variables de entorno (ejemplo en PowerShell):
#   $env:MYSQL_PASSWORD="tu_password"
#   $env:MONGO_URI="mongodb+srv://usuario:pass@cluster.mongodb.net"
npm run dev
# API -> http://localhost:4000/api/health
```

## 3. Ejecutar el frontend (local)

```bash
cd frontend
npm install
npm run dev
# App -> http://localhost:5173
```

## 4. Despliegue con GitHub

Publicar el codigo fuente en un repositorio:

```bash
git init
git add .
git commit -m "Sistema de gestion de tareas - PC2"
git branch -M main
git remote add origin https://github.com/USUARIO/gestor-tareas.git
git push -u origin main
```

Al hacer push a `main`, el workflow de `.github/workflows/deploy.yml` construye el
frontend y lo publica automaticamente en **GitHub Pages**. Activar Pages en:
Settings -> Pages -> Source: "GitHub Actions".

La URL publica queda: `https://USUARIO.github.io/gestor-tareas/`

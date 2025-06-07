-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS grupos_eventos_db;

-- Usar la base de datos
USE grupos_eventos_db;

-- Tabla de grupos
CREATE TABLE IF NOT EXISTS grupos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  creador_id VARCHAR(36) NOT NULL,
  privacidad ENUM('PUBLICO', 'CERRADO', 'SECRETO') NOT NULL DEFAULT 'PUBLICO',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de miembros de grupo
CREATE TABLE IF NOT EXISTS miembros_grupo (
  grupo_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  rol ENUM('MIEMBRO', 'MODERADOR', 'ADMINISTRADOR') NOT NULL DEFAULT 'MIEMBRO',
  fecha_union DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (grupo_id, usuario_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
);

-- Tabla de publicaciones de grupo
CREATE TABLE IF NOT EXISTS publicaciones_grupo (
  id VARCHAR(36) PRIMARY KEY,
  grupo_id VARCHAR(36) NOT NULL,
  autor_id VARCHAR(36) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aprobada BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  creador_id VARCHAR(36) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME,
  privacidad ENUM('PUBLICO', 'PRIVADO', 'SOLO_INVITADOS') NOT NULL DEFAULT 'PUBLICO',
  grupo_id VARCHAR(36),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
);

-- Tabla de asistentes a eventos
CREATE TABLE IF NOT EXISTS asistentes_evento (
  evento_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  estado ENUM('ASISTIRA', 'INTERESADO', 'NO_ASISTIRA', 'SIN_RESPUESTA') NOT NULL DEFAULT 'SIN_RESPUESTA',
  fecha_respuesta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evento_id, usuario_id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
); 
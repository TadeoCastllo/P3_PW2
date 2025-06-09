USE examen_db;

-- Tabla de usuarios con autenticación mejorada
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'profesor') NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    ultimo_acceso TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de exámenes/conjuntos de preguntas
CREATE TABLE IF NOT EXISTS examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    profesor_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de preguntas con tipo y contexto
CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    examen_id INT NOT NULL,
    contexto TEXT NOT NULL,
    enunciado TEXT NOT NULL,
    tipo ENUM('opcion_multiple', 'completar', 'codigo') NOT NULL,
    opciones JSON DEFAULT NULL, -- Para preguntas de opción múltiple
    respuesta_modelo TEXT, -- Respuesta esperada para comparación
    generada_por_ia BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

-- Tabla de respuestas con evaluación de IA
CREATE TABLE IF NOT EXISTS respuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    examen_id INT NOT NULL,
    respuesta_texto TEXT NOT NULL,
    calificacion DECIMAL(5,2), -- Ej: 8.50/10
    retroalimentacion_ia TEXT,
    tiempo_respuesta INT COMMENT 'Tiempo en segundos',
    enviada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

-- Tabla de resultados consolidados
CREATE TABLE IF NOT EXISTS resultados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    examen_id INT NOT NULL,
    calificacion_final DECIMAL(5,2) NOT NULL,
    preguntas_correctas INT NOT NULL,
    completado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

-- Datos iniciales
INSERT IGNORE INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Profesor Admin', 'profesor@escuela.com', '$2y$10$EjemploHashSeguro123', 'profesor'),
('Estudiante Demo', 'estudiante@escuela.com', '$2y$10$EjemploHashSeguro456', 'estudiante');

-- Ejemplo de examen inicial
INSERT IGNORE INTO examenes (titulo, descripcion, profesor_id) VALUES
('Evaluacion de Programacion Basica', 'Conceptos fundamentales de programacion', 1);
-- =====================================================
-- SISTEMA RESTAURANTE - VERSIÓN SIMPLE Y DIRECTA
-- Fecha: 2025-06-09 02:53:39 UTC
-- Usuario: Chucharizard
-- =====================================================

-- Corregir sintaxis (falta espacio)
CREATE DATABASE RestauranteOficial;
GO

USE RestauranteOficial;
GO

-- Tabla 1: Mesa
CREATE TABLE Mesa (
    id_mesa INT IDENTITY(1,1) PRIMARY KEY,
	nombre_mesa VARCHAR(20) NOT NULL, -- se usara para buscarlo
    capacidad TINYINT NOT NULL,  -- numero 2 a 20
    ubicacion VARCHAR(50) NOT NULL,  -- primer piso, segundo piso, patio 
    estado_disponible VARCHAR(20) NOT NULL DEFAULT 'libre' -- Estado disponible libre, ocupado, reservado
);

-- Tabla 2: Categoria
CREATE TABLE Categoria (
    id_categoria INT PRIMARY KEY IDENTITY(1,1),
    nombre_categoria VARCHAR(30) NOT NULL -- entradas, sopas, segundos, postres, refrescos, bebidas
);

-- Tabla 3: Producto
CREATE TABLE Producto (
    id_producto INT PRIMARY KEY IDENTITY(1,1),
    nombre_producto VARCHAR(50) NOT NULL,
    precio_producto DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
	url_web_producto VARCHAR(MAX) NULL, 
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 4: Empleado
CREATE TABLE Empleado (
    ci_empleado VARCHAR(20) PRIMARY KEY,
    nombre_empleado VARCHAR(50) NOT NULL,
    apellido_empleado VARCHAR(50) NOT NULL,
    cargo_empleado VARCHAR(20) NOT NULL, -- administrador, cajero, cocina, mesero
    celular_empleado VARCHAR(15) NOT NULL
);

-- Tabla 5: UsuarioEmpleado
CREATE TABLE UsuarioEmpleado (
    ci_empleado VARCHAR(20) PRIMARY KEY,
    password_empleado VARCHAR(100) NOT NULL, -- sera el ci_empleado
    nivel_acceso_empleado VARCHAR(20) NOT NULL, -- administrador, cajero, cocina, mesero (obligatorio)
    FOREIGN KEY (ci_empleado) REFERENCES Empleado(ci_empleado)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 6: Cliente
CREATE TABLE Cliente (
    ci_cliente VARCHAR(20) PRIMARY KEY, -- usuario el ci_cliente
    nombre_cliente VARCHAR(50) NOT NULL,
    apellido_cliente VARCHAR(50) NOT NULL,
    telefono_cliente VARCHAR(15) NOT NULL,
    direccion_cliente VARCHAR(100) NULL,
    password_cliente VARCHAR(100) NOT NULL, -- sera el ci_cliente
    es_pensionado BIT NOT NULL -- 0 = no, 1 = sí
);

-- Tabla 7: Menu
CREATE TABLE Menu (
    id_menu INT PRIMARY KEY IDENTITY(1,1),
    nombre_menu VARCHAR(50) NOT NULL,
    precio_menu DECIMAL(10,2) NOT NULL,
    fecha_menu DATE NOT NULL
);

-- Tabla 8: Detalle_menu (productos que conforman un menú)
CREATE TABLE Detalle_menu (
    id_detalle_menu INT PRIMARY KEY IDENTITY(1,1),
    id_producto INT NOT NULL,
    id_menu INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_menu) REFERENCES Menu(id_menu)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 9: Pension
CREATE TABLE Pension (
    id_pension INT PRIMARY KEY IDENTITY(1,1),
    ci_cliente VARCHAR(20) NOT NULL,
    cantidad_completos_pension INT NOT NULL, -- completos que compra
    consumo_completos_pension INT NOT NULL DEFAULT 0, -- comparamos con cantidad_completos para saber si ya se paso o no
    fecha_creacion_pension DATE NOT NULL,
    fecha_fin_pension DATE NOT NULL, -- +15 dias sumados a la cantidad de platos comprados 
	-- ej: 30 + 15 = 45 dias desde la fecha de creacion hasta la resultante considerando ambas fechas
    estado_vigente_pension VARCHAR(10) NOT NULL DEFAULT 'vigente', -- 'vigente', 'terminada'
    total_precio_pension DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ci_cliente) REFERENCES Cliente(ci_cliente)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 10: Reserva
CREATE TABLE Reserva (
    id_reserva INT PRIMARY KEY IDENTITY(1,1),
    ci_cliente VARCHAR(20) NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    numero_personas INT NOT NULL,
    notas VARCHAR(300) NULL,
    estado_reserva VARCHAR(20) NOT NULL DEFAULT 'pendiente', 	
	-- pendiente, confirmada, cancelada, vencida (crear un trigger para cambiar el estado de la mesa a vencida)
	id_mesa INT NOT NULL,
    FOREIGN KEY (ci_cliente) REFERENCES Cliente(ci_cliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 11: Orden
CREATE TABLE Orden (
    id_orden INT PRIMARY KEY IDENTITY(1,1),
    estado_orden VARCHAR(10) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'entregado', 'pagado'
    fecha_orden DATETIME2 NOT NULL, -- fecha y hora
    ci_cliente VARCHAR(20) NOT NULL,
    ci_empleado VARCHAR(20) NULL,
	total_orden DECIMAL(10,2) NOT NULL DEFAULT 0,
	id_mesa INT NOT NULL,
    FOREIGN KEY (ci_cliente) REFERENCES Cliente(ci_cliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ci_empleado) REFERENCES Empleado(ci_empleado)
        ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 12: Detalle_orden_producto (productos individuales de una orden)
CREATE TABLE Detalle_orden_producto (
    id_detalle_orden_producto INT PRIMARY KEY IDENTITY(1,1),
    id_orden INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_orden_producto INT NOT NULL,
	total_detalle_orden_producto DECIMAL(10,2) NOT NULL, -- en funcion a la cantidad de producto que quiere con su precio_producto
    FOREIGN KEY (id_orden) REFERENCES Orden(id_orden)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 13: Detalle_orden_menu (menús completos pedidos en una orden)
CREATE TABLE Detalle_orden_menu (
    id_detalle_orden_menu INT PRIMARY KEY IDENTITY(1,1),
    id_orden INT NOT NULL,
    id_menu INT NOT NULL,
    cantidad_orden_menu INT NOT NULL, -- en funcion a la cantidad de menus que quiere con su precio_menu
	total_detalle_orden_menu DECIMAL(10,2) NOT NULL, -- en funcion a la cantidad de menus que quiere con su precio_menu
    FOREIGN KEY (id_orden) REFERENCES Orden(id_orden)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_menu) REFERENCES Menu(id_menu)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 14: Pago
CREATE TABLE Pago (
    id_pago INT PRIMARY KEY IDENTITY(1,1),
    id_orden INT NOT NULL, -- liberar mesa asignada
    metodo_pago VARCHAR(20) NOT NULL, -- 'qr', 'efectivo', 'transferencia'
    FOREIGN KEY (id_orden) REFERENCES Orden(id_orden)
        ON DELETE CASCADE ON UPDATE CASCADE
);

PRINT '🎉 BASE DE DATOS SIMPLE CREADA EXITOSAMENTE';
PRINT '📅 2025-06-09 02:53:39 UTC';
PRINT '👤 Chucharizard';
PRINT '🚀 ¡Lista para usar!';

-- =====================================================
-- CONFIGURACIÓN DE USUARIO PARA LA APLICACIÓN
-- =====================================================

-- Crear login para la aplicación
CREATE LOGIN restaurante_user WITH PASSWORD = 'RestauranteApp2024!';

-- Usar la base de datos
USE RestauranteOficial;

-- Crear usuario en la base de datos
CREATE USER restaurante_user FOR LOGIN restaurante_user;

-- Otorgar permisos necesarios
ALTER ROLE db_datareader ADD MEMBER restaurante_user;
ALTER ROLE db_datawriter ADD MEMBER restaurante_user;

PRINT '👤 Usuario de aplicación creado: restaurante_user';
PRINT '🔑 Contraseña: RestauranteApp2024!';
PRINT '✅ Permisos otorgados correctamente';

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Insertar categorías
INSERT INTO Categoria (nombre_categoria) VALUES 
('Plato Principal'),
('Bebida'),
('Postre'),
('Entrada');

-- Insertar productos
INSERT INTO Producto (nombre_producto, precio_producto, id_categoria, url_web_producto) VALUES 
('Pollo a la plancha', 25.00, 1, NULL),
('Arroz con frijoles', 15.00, 1, NULL),
('Ensalada mixta', 12.00, 4, NULL),
('Jugo de naranja', 8.00, 2, NULL),
('Flan casero', 10.00, 3, NULL);

-- Insertar menú de hoy
INSERT INTO Menu (nombre_menu, precio_menu, fecha_menu) VALUES 
('Menú Ejecutivo', 35.00, CAST(GETDATE() AS DATE)),
('Menú Vegetariano', 28.00, CAST(GETDATE() AS DATE));

-- Relacionar productos con menús
INSERT INTO Detalle_menu (id_producto, id_menu) VALUES 
(1, 1), -- Pollo en Menú Ejecutivo
(2, 1), -- Arroz en Menú Ejecutivo
(4, 1), -- Jugo en Menú Ejecutivo
(3, 2), -- Ensalada en Menú Vegetariano
(2, 2), -- Arroz en Menú Vegetariano
(4, 2); -- Jugo en Menú Vegetariano

-- Insertar mesas de prueba
INSERT INTO Mesa (nombre_mesa, capacidad, ubicacion, estado_disponible) VALUES 
('Mesa 1', 2, 'Primer Piso', 'libre'),
('Mesa 2', 4, 'Primer Piso', 'libre'),
('Mesa 3', 6, 'Primer Piso', 'libre'),
('Mesa 4', 2, 'Segundo Piso', 'libre'),
('Mesa 5', 4, 'Segundo Piso', 'libre'),
('Mesa 6', 8, 'Segundo Piso', 'libre'),
('Mesa 7', 4, 'Patio', 'libre'),
('Mesa 8', 6, 'Patio', 'libre'),
('Mesa 9', 10, 'Patio', 'libre'),
('Mesa 10', 12, 'Patio', 'libre');

PRINT '🍽️ Datos de prueba insertados correctamente';
PRINT '🪑 Mesas creadas correctamente';
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN QUE FUNCIONA - Adaptada para el restaurante
const config = {
    user: 'restaurante_user',
    password: 'RestauranteApp2024!',
    server: 'localhost',
    database: 'RestauranteOficial',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool;

const conectarBD = async() => {
    try {
        pool = await sql.connect(config);
        console.log('✅ Conectado a la base de datos RestauranteOficial exitosamente');
    } catch(err) {
        console.error('❌ Error de conexión:', err);
    }
};

// Middleware para verificar conexión antes de procesar requests
app.use(async (req, res, next) => {
    if (!pool) {
        const conectado = await conectarBD();
        if (!conectado) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }
    }
    next();
});

// ==================== ENDPOINTS DE MENÚS ====================

// Obtener todos los menús
app.get('/api/menus', async(req, res) => {
    try {
        const result = await pool.request()
            .query('SELECT id_menu, nombre_menu, precio_menu, fecha_menu FROM Menu ORDER BY fecha_menu DESC');
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener menús:', err);
        res.status(500).json({ error: 'Error al obtener los menús' });
    }
});

// Obtener menús por fecha específica
app.get('/api/menus/fecha/:fecha', async(req, res) => {
    const { fecha } = req.params;
    try {
        const result = await pool.request()
            .input('fecha', sql.Date, fecha)
            .query('SELECT id_menu, nombre_menu, precio_menu, fecha_menu FROM Menu WHERE fecha_menu = @fecha');
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener menús por fecha:', err);
        res.status(500).json({ error: 'Error al obtener menús por fecha' });
    }
});

// Obtener menú completo con sus productos (detalles)
app.get('/api/menus/:id/detalle', async(req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    m.id_menu,
                    m.nombre_menu,
                    m.precio_menu,
                    m.fecha_menu,
                    p.id_producto,
                    p.nombre_producto,
                    p.precio_producto,
                    c.nombre_categoria
                FROM Menu m
                INNER JOIN Detalle_menu dm ON m.id_menu = dm.id_menu
                INNER JOIN Producto p ON dm.id_producto = p.id_producto
                INNER JOIN Categoria c ON p.id_categoria = c.id_categoria
                WHERE m.id_menu = @id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }
        
        // Estructurar la respuesta agrupando los productos del menú
        const menu = {
            id_menu: result.recordset[0].id_menu,
            nombre_menu: result.recordset[0].nombre_menu,
            precio_menu: result.recordset[0].precio_menu,
            fecha_menu: result.recordset[0].fecha_menu,
            productos: result.recordset.map(row => ({
                id_producto: row.id_producto,
                nombre_producto: row.nombre_producto,
                precio_producto: row.precio_producto,
                categoria: row.nombre_categoria,
                cantidad_pensionado: null // Ya no existe este campo
            }))
        };
        
        res.json(menu);
    } catch(err) {
        console.error('Error al obtener detalle del menú:', err);
        res.status(500).json({ error: 'Error al obtener detalle del menú' });
    }
});

// Obtener menús de hoy
app.get('/api/menus/hoy', async(req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT id_menu, nombre_menu, precio_menu, fecha_menu 
                FROM Menu 
                WHERE fecha_menu = CAST(GETDATE() AS DATE)
                ORDER BY nombre_menu
            `);
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener menús de hoy:', err);
        res.status(500).json({ error: 'Error al obtener menús de hoy' });
    }
});

// ==================== ENDPOINTS DE RESERVAS ====================

// Buscar cliente por CI (para autocompletar datos)
app.get('/api/clientes/:ci', async(req, res) => {
    const { ci } = req.params;
    try {
        const result = await pool.request()
            .input('ci', sql.VarChar, ci)
            .query('SELECT ci_cliente, nombre_cliente, apellido_cliente, telefono_cliente FROM Cliente WHERE ci_cliente = @ci');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json(result.recordset[0]);
    } catch(err) {
        console.error('Error al buscar cliente:', err);
        res.status(500).json({ error: 'Error al buscar cliente' });
    }
});

// Verificar si el cliente tiene reservas pendientes
app.get('/api/clientes/:ci/reservas-pendientes', async(req, res) => {
    const { ci } = req.params;
    try {
        const result = await pool.request()
            .input('ci', sql.VarChar, ci)
            .query(`
                SELECT r.*, m.nombre_mesa, m.ubicacion, m.capacidad
                FROM Reserva r
                INNER JOIN Mesa m ON r.id_mesa = m.id_mesa
                WHERE r.ci_cliente = @ci 
                AND r.estado_reserva IN ('pendiente', 'confirmada')
                ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
            `);
        
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al buscar reservas pendientes:', err);
        res.status(500).json({ error: 'Error al buscar reservas pendientes' });
    }
});

// Obtener todas las mesas disponibles
app.get('/api/mesas', async(req, res) => {
    try {
        const result = await pool.request()
            .query('SELECT id_mesa, nombre_mesa, capacidad, ubicacion, estado_disponible FROM Mesa ORDER BY nombre_mesa');
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener mesas:', err);
        res.status(500).json({ error: 'Error al obtener mesas' });
    }
});

// Obtener mesas disponibles para una fecha y hora específica
app.get('/api/mesas/disponibles', async(req, res) => {
    const { fecha, hora } = req.query;
    
    console.log('Parámetros recibidos:', { fecha, hora }); // Debug
    
    if (!fecha || !hora) {
        return res.status(400).json({ error: 'Fecha y hora son requeridos' });
    }
    
    try {
        // Crear un objeto Date completo para el parámetro TIME
        let horaFormateada = hora;
        
        // Si la hora viene en formato HH:MM, agregar segundos
        if (hora.split(':').length === 2) {
            horaFormateada = `${hora}:00`;
        }
        
        // Crear una fecha/hora completa para usar como parámetro
        const fechaHoraCompleta = `${fecha} ${horaFormateada}`;
        console.log('Fecha y hora completa:', fechaHoraCompleta); // Debug
        
        const result = await pool.request()
            .input('fecha', sql.Date, fecha)
            .input('hora_string', sql.VarChar, horaFormateada) // Usar como string en lugar de TIME
            .query(`
                SELECT m.id_mesa, m.nombre_mesa, m.capacidad, m.ubicacion
                FROM Mesa m
                WHERE m.id_mesa NOT IN (
                    SELECT DISTINCT r.id_mesa 
                    FROM Reserva r 
                    WHERE r.fecha_reserva = @fecha 
                    AND CAST(r.hora_reserva AS VARCHAR(8)) = @hora_string
                    AND r.estado_reserva IN ('pendiente', 'confirmada')
                )
                AND m.estado_disponible = 'libre'
                ORDER BY m.nombre_mesa
            `);
        
        console.log('Mesas disponibles encontradas:', result.recordset.length); // Debug
        res.json(result.recordset);
    } catch(err) {
        console.error('Error detallado al obtener mesas disponibles:', err);
        res.status(500).json({ 
            error: 'Error al obtener mesas disponibles',
            details: err.message 
        });
    }
});

// Crear nueva reserva (con cliente si no existe)
app.post('/api/reservas', async(req, res) => {
    const { 
        ci_cliente, 
        nombre_cliente, 
        apellido_cliente, 
        telefono_cliente,
        fecha_reserva,
        hora_reserva,
        numero_personas,
        notas,
        id_mesa
    } = req.body;

    console.log('Datos recibidos para reserva:', req.body); // Debug

    if (!ci_cliente || !nombre_cliente || !apellido_cliente || !telefono_cliente || 
        !fecha_reserva || !hora_reserva || !numero_personas || !id_mesa) {
        return res.status(400).json({ error: 'Datos incompletos para la reserva' });
    }

    // Formatear hora si es necesario
    let horaFormateada = hora_reserva;
    if (hora_reserva && hora_reserva.split(':').length === 2) {
        horaFormateada = `${hora_reserva}:00`;
    }

    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();

        // Verificar si el cliente ya tiene reservas pendientes
        const reservasPendientes = await transaction.request()
            .input('ci', sql.VarChar, ci_cliente)
            .query(`
                SELECT COUNT(*) as cantidad 
                FROM Reserva 
                WHERE ci_cliente = @ci 
                AND estado_reserva IN ('pendiente', 'confirmada')
            `);

        if (reservasPendientes.recordset[0].cantidad > 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'El cliente ya tiene una reserva pendiente' });
        }

        // Verificar si la mesa está disponible para esa fecha y hora (usando string comparison)
        const mesaOcupada = await transaction.request()
            .input('fecha', sql.Date, fecha_reserva)
            .input('hora_string', sql.VarChar, horaFormateada)
            .input('id_mesa', sql.Int, id_mesa)
            .query(`
                SELECT COUNT(*) as cantidad 
                FROM Reserva 
                WHERE fecha_reserva = @fecha 
                AND CAST(hora_reserva AS VARCHAR(8)) = @hora_string
                AND id_mesa = @id_mesa
                AND estado_reserva IN ('pendiente', 'confirmada')
            `);

        if (mesaOcupada.recordset[0].cantidad > 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'La mesa ya está reservada para esa fecha y hora' });
        }

        // Verificar si el cliente existe, si no, crearlo
        const clienteExiste = await transaction.request()
            .input('ci', sql.VarChar, ci_cliente)
            .query('SELECT ci_cliente FROM Cliente WHERE ci_cliente = @ci');

        if (clienteExiste.recordset.length === 0) {
            // Crear nuevo cliente
            await transaction.request()
                .input('ci_cliente', sql.VarChar, ci_cliente)
                .input('nombre_cliente', sql.VarChar, nombre_cliente)
                .input('apellido_cliente', sql.VarChar, apellido_cliente)
                .input('telefono_cliente', sql.VarChar, telefono_cliente)
                .input('password_cliente', sql.VarChar, ci_cliente) // Contraseña = CI
                .input('es_pensionado', sql.Bit, 0) // Por defecto no es pensionado
                .query(`
                    INSERT INTO Cliente (ci_cliente, nombre_cliente, apellido_cliente, telefono_cliente, password_cliente, es_pensionado)
                    VALUES (@ci_cliente, @nombre_cliente, @apellido_cliente, @telefono_cliente, @password_cliente, @es_pensionado)
                `);
        }

        // Crear la reserva - convertir string a TIME en la consulta
        await transaction.request()
            .input('ci_cliente', sql.VarChar, ci_cliente)
            .input('fecha_reserva', sql.Date, fecha_reserva)
            .input('hora_string', sql.VarChar, horaFormateada)
            .input('numero_personas', sql.Int, numero_personas)
            .input('notas', sql.VarChar, notas || null)
            .input('id_mesa', sql.Int, id_mesa)
            .query(`
                INSERT INTO Reserva (ci_cliente, fecha_reserva, hora_reserva, numero_personas, notas, id_mesa)
                VALUES (@ci_cliente, @fecha_reserva, CAST(@hora_string AS TIME), @numero_personas, @notas, @id_mesa)
            `);

        await transaction.commit();
        console.log('Reserva creada exitosamente para:', ci_cliente); // Debug
        res.status(201).json({ message: 'Reserva creada exitosamente' });

    } catch(err) {
        await transaction.rollback();
        console.error('Error al crear reserva:', err);
        res.status(500).json({ error: 'Error al crear la reserva', details: err.message });
    }
});

// ==================== ENDPOINTS DE AUTENTICACIÓN ====================

// Login de empleados
app.post('/api/auth/login', async(req, res) => {
    const { ci_empleado, password_empleado } = req.body;

    console.log('Intento de login:', { ci_empleado }); // Debug (no logear password)

    if (!ci_empleado || !password_empleado) {
        return res.status(400).json({ error: 'CI y contraseña son requeridos' });
    }

    try {
        const result = await pool.request()
            .input('ci', sql.VarChar, ci_empleado)
            .input('password', sql.VarChar, password_empleado)
            .query(`
                SELECT 
                    e.ci_empleado,
                    e.nombre_empleado,
                    e.apellido_empleado,
                    e.cargo_empleado,
                    u.nivel_acceso_empleado
                FROM Empleado e
                INNER JOIN UsuarioEmpleado u ON e.ci_empleado = u.ci_empleado
                WHERE e.ci_empleado = @ci AND u.password_empleado = @password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const empleado = result.recordset[0];
        
        // En una aplicación real, aquí generarías un JWT token
        // Por simplicidad, devolvemos la información del empleado
        res.json({
            message: 'Login exitoso',
            empleado: {
                ci: empleado.ci_empleado,
                nombre: empleado.nombre_empleado,
                apellido: empleado.apellido_empleado,
                cargo: empleado.cargo_empleado,
                nivelAcceso: empleado.nivel_acceso_empleado
            }
        });

        console.log('Login exitoso para:', empleado.nombre_empleado, empleado.apellido_empleado);

    } catch(err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE ÓRDENES ====================

// Obtener todas las mesas libres para órdenes
app.get('/api/ordenes/mesas-libres', async(req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT id_mesa, nombre_mesa, capacidad, ubicacion
                FROM Mesa 
                WHERE estado_disponible = 'libre'
                ORDER BY nombre_mesa
            `);
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener mesas libres:', err);
        res.status(500).json({ error: 'Error al obtener mesas libres' });
    }
});

// Obtener todos los productos disponibles
app.get('/api/productos', async(req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    p.precio_producto,
                    c.nombre_categoria
                FROM Producto p
                INNER JOIN Categoria c ON p.id_categoria = c.id_categoria
                ORDER BY c.nombre_categoria, p.nombre_producto
            `);
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Obtener menús disponibles (de hoy)
app.get('/api/ordenes/menus-disponibles', async(req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT id_menu, nombre_menu, precio_menu, fecha_menu 
                FROM Menu 
                WHERE fecha_menu = CAST(GETDATE() AS DATE)
                ORDER BY nombre_menu
            `);
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener menús disponibles:', err);
        res.status(500).json({ error: 'Error al obtener menús disponibles' });
    }
});

// Crear nueva orden
app.post('/api/ordenes', async(req, res) => {
    const { 
        ci_cliente, 
        nombre_cliente, 
        apellido_cliente, 
        telefono_cliente,
        id_mesa,
        ci_empleado,
        productos, // Array de {id_producto, cantidad}
        menus, // Array de {id_menu, cantidad}
        total_orden
    } = req.body;

    console.log('Datos recibidos para orden:', req.body); // Debug

    if (!ci_cliente || !nombre_cliente || !apellido_cliente || !id_mesa || !ci_empleado) {
        return res.status(400).json({ error: 'Datos básicos incompletos para la orden' });
    }

    if ((!productos || productos.length === 0) && (!menus || menus.length === 0)) {
        return res.status(400).json({ error: 'Debe agregar al menos un producto o menú' });
    }

    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();

        // Verificar si el cliente existe, si no, crearlo
        const clienteExiste = await transaction.request()
            .input('ci', sql.VarChar, ci_cliente)
            .query('SELECT ci_cliente FROM Cliente WHERE ci_cliente = @ci');

        if (clienteExiste.recordset.length === 0) {
            // Crear nuevo cliente
            await transaction.request()
                .input('ci_cliente', sql.VarChar, ci_cliente)
                .input('nombre_cliente', sql.VarChar, nombre_cliente)
                .input('apellido_cliente', sql.VarChar, apellido_cliente)
                .input('telefono_cliente', sql.VarChar, telefono_cliente || '00000000')
                .input('password_cliente', sql.VarChar, ci_cliente) // Contraseña = CI
                .input('es_pensionado', sql.Bit, 0) // Por defecto no es pensionado
                .query(`
                    INSERT INTO Cliente (ci_cliente, nombre_cliente, apellido_cliente, telefono_cliente, password_cliente, es_pensionado)
                    VALUES (@ci_cliente, @nombre_cliente, @apellido_cliente, @telefono_cliente, @password_cliente, @es_pensionado)
                `);
        }

        // Cambiar estado de la mesa a ocupado
        await transaction.request()
            .input('id_mesa', sql.Int, id_mesa)
            .query(`UPDATE Mesa SET estado_disponible = 'ocupado' WHERE id_mesa = @id_mesa`);

        // Crear la orden
        const ordenResult = await transaction.request()
            .input('ci_cliente', sql.VarChar, ci_cliente)
            .input('ci_empleado', sql.VarChar, ci_empleado)
            .input('id_mesa', sql.Int, id_mesa)
            .input('total_orden', sql.Decimal(10,2), total_orden)
            .query(`
                INSERT INTO Orden (estado_orden, fecha_orden, ci_cliente, ci_empleado, total_orden, id_mesa)
                OUTPUT INSERTED.id_orden
                VALUES ('pendiente', GETDATE(), @ci_cliente, @ci_empleado, @total_orden, @id_mesa)
            `);

        const id_orden = ordenResult.recordset[0].id_orden;

        // Insertar productos en la orden
        if (productos && productos.length > 0) {
            for (const producto of productos) {
                // Obtener precio del producto
                const precioResult = await transaction.request()
                    .input('id_producto', sql.Int, producto.id_producto)
                    .query('SELECT precio_producto FROM Producto WHERE id_producto = @id_producto');
                
                const precio_unitario = precioResult.recordset[0].precio_producto;
                const total_detalle = precio_unitario * producto.cantidad;

                await transaction.request()
                    .input('id_orden', sql.Int, id_orden)
                    .input('id_producto', sql.Int, producto.id_producto)
                    .input('cantidad', sql.Int, producto.cantidad)
                    .input('total_detalle', sql.Decimal(10,2), total_detalle)
                    .query(`
                        INSERT INTO Detalle_orden_producto (id_orden, id_producto, cantidad_orden_producto, total_detalle_orden_producto)
                        VALUES (@id_orden, @id_producto, @cantidad, @total_detalle)
                    `);
            }
        }

        // Insertar menús en la orden
        if (menus && menus.length > 0) {
            for (const menu of menus) {
                // Obtener precio del menú
                const precioResult = await transaction.request()
                    .input('id_menu', sql.Int, menu.id_menu)
                    .query('SELECT precio_menu FROM Menu WHERE id_menu = @id_menu');
                
                const precio_unitario = precioResult.recordset[0].precio_menu;
                const total_detalle = precio_unitario * menu.cantidad;

                await transaction.request()
                    .input('id_orden', sql.Int, id_orden)
                    .input('id_menu', sql.Int, menu.id_menu)
                    .input('cantidad', sql.Int, menu.cantidad)
                    .input('total_detalle', sql.Decimal(10,2), total_detalle)
                    .query(`
                        INSERT INTO Detalle_orden_menu (id_orden, id_menu, cantidad_orden_menu, total_detalle_orden_menu)
                        VALUES (@id_orden, @id_menu, @cantidad, @total_detalle)
                    `);
            }
        }

        await transaction.commit();
        console.log('Orden creada exitosamente:', id_orden); // Debug
        res.status(201).json({ 
            message: 'Orden creada exitosamente',
            id_orden: id_orden
        });

    } catch(err) {
        await transaction.rollback();
        console.error('Error al crear orden:', err);
        res.status(500).json({ error: 'Error al crear la orden', details: err.message });
    }
});

// Obtener órdenes pendientes para cocina
app.get('/api/ordenes/cocina', async(req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT 
                    o.id_orden,
                    o.fecha_orden,
                    o.total_orden,
                    o.estado_orden,
                    c.nombre_cliente,
                    c.apellido_cliente,
                    m.nombre_mesa,
                    e.nombre_empleado,
                    e.apellido_empleado
                FROM Orden o
                INNER JOIN Cliente c ON o.ci_cliente = c.ci_cliente
                INNER JOIN Mesa m ON o.id_mesa = m.id_mesa
                INNER JOIN Empleado e ON o.ci_empleado = e.ci_empleado
                WHERE o.estado_orden IN ('pendiente', 'preparando', 'listo')
                ORDER BY o.fecha_orden ASC
            `);
        res.json(result.recordset);
    } catch(err) {
        console.error('Error al obtener órdenes para cocina:', err);
        res.status(500).json({ error: 'Error al obtener órdenes para cocina' });
    }
});

// Obtener detalle completo de una orden para cocina
app.get('/api/ordenes/:id/detalle-cocina', async(req, res) => {
    const { id } = req.params;
    try {
        // Obtener productos de la orden con estados individuales
        const productos = await pool.request()
            .input('id_orden', sql.Int, id)
            .query(`
                SELECT 
                    dop.id_detalle_orden_producto,
                    p.nombre_producto,
                    dop.cantidad_orden_producto,
                    dop.estado_detalle,
                    c.nombre_categoria
                FROM Detalle_orden_producto dop
                INNER JOIN Producto p ON dop.id_producto = p.id_producto
                INNER JOIN Categoria c ON p.id_categoria = c.id_categoria
                WHERE dop.id_orden = @id_orden
            `);

        // Obtener menús de la orden con estados individuales
        const menus = await pool.request()
            .input('id_orden', sql.Int, id)
            .query(`
                SELECT 
                    dom.id_detalle_orden_menu,
                    m.nombre_menu,
                    dom.cantidad_orden_menu,
                    dom.estado_detalle
                FROM Detalle_orden_menu dom
                INNER JOIN Menu m ON dom.id_menu = m.id_menu
                WHERE dom.id_orden = @id_orden
            `);

        res.json({
            productos: productos.recordset,
            menus: menus.recordset
        });
    } catch(err) {
        console.error('Error al obtener detalle de orden para cocina:', err);
        res.status(500).json({ error: 'Error al obtener detalle de orden para cocina' });
    }
});

// Actualizar estado de un producto específico
app.put('/api/ordenes/producto/:id/estado', async(req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente', 'preparando', 'listo', 'entregado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();

        // Actualizar estado del producto
        await transaction.request()
            .input('id_detalle', sql.Int, id)
            .input('nuevo_estado', sql.VarChar, estado)
            .query(`
                UPDATE Detalle_orden_producto 
                SET estado_detalle = @nuevo_estado 
                WHERE id_detalle_orden_producto = @id_detalle
            `);

        // Obtener id_orden para actualizar estado general
        const ordenResult = await transaction.request()
            .input('id_detalle', sql.Int, id)
            .query('SELECT id_orden FROM Detalle_orden_producto WHERE id_detalle_orden_producto = @id_detalle');

        const id_orden = ordenResult.recordset[0].id_orden;

        // Actualizar estado general de la orden
        await actualizarEstadoOrden(transaction, id_orden);

        await transaction.commit();
        res.json({ message: 'Estado actualizado exitosamente' });

    } catch(err) {
        await transaction.rollback();
        console.error('Error al actualizar estado de producto:', err);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

// Actualizar estado de un menú específico
app.put('/api/ordenes/menu/:id/estado', async(req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente', 'preparando', 'listo', 'entregado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();

        // Actualizar estado del menú
        await transaction.request()
            .input('id_detalle', sql.Int, id)
            .input('nuevo_estado', sql.VarChar, estado)
            .query(`
                UPDATE Detalle_orden_menu 
                SET estado_detalle = @nuevo_estado 
                WHERE id_detalle_orden_menu = @id_detalle
            `);

        // Obtener id_orden para actualizar estado general
        const ordenResult = await transaction.request()
            .input('id_detalle', sql.Int, id)
            .query('SELECT id_orden FROM Detalle_orden_menu WHERE id_detalle_orden_menu = @id_detalle');

        const id_orden = ordenResult.recordset[0].id_orden;

        // Actualizar estado general de la orden
        await actualizarEstadoOrden(transaction, id_orden);

        await transaction.commit();
        res.json({ message: 'Estado actualizado exitosamente' });

    } catch(err) {
        await transaction.rollback();
        console.error('Error al actualizar estado de menú:', err);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

// Función para actualizar el estado general de la orden
async function actualizarEstadoOrden(transaction, id_orden) {
    // Verificar estados de todos los detalles
    const estadosResult = await transaction.request()
        .input('id_orden', sql.Int, id_orden)
        .query(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN estado_detalle = 'entregado' THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN estado_detalle IN ('pendiente', 'preparando') THEN 1 ELSE 0 END) as en_proceso,
                SUM(CASE WHEN estado_detalle = 'listo' THEN 1 ELSE 0 END) as listos
            FROM (
                SELECT estado_detalle FROM Detalle_orden_producto WHERE id_orden = @id_orden
                UNION ALL
                SELECT estado_detalle FROM Detalle_orden_menu WHERE id_orden = @id_orden
            ) as todos_detalles
        `);

    const { total_items, entregados, en_proceso, listos } = estadosResult.recordset[0];
    let nuevoEstado = 'pendiente';

    if (entregados === total_items) {
        nuevoEstado = 'entregado';
        // Liberar mesa
        await transaction.request()
            .input('id_orden', sql.Int, id_orden)
            .query(`
                UPDATE Mesa SET estado_disponible = 'libre' 
                WHERE id_mesa = (SELECT id_mesa FROM Orden WHERE id_orden = @id_orden)
            `);
    } else if (listos === total_items) {
        nuevoEstado = 'listo';
    } else if (en_proceso > 0) {
        nuevoEstado = 'preparando';
    }

    // Actualizar estado de la orden
    await transaction.request()
        .input('id_orden', sql.Int, id_orden)
        .input('nuevo_estado', sql.VarChar, nuevoEstado)
        .query('UPDATE Orden SET estado_orden = @nuevo_estado WHERE id_orden = @id_orden');
}

const PORT = 5000;
app.listen(PORT, async() => {
    console.log(`🚀 Servidor del restaurante corriendo en puerto ${PORT}`);
    await conectarBD();
});


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

const PORT = 5000;
app.listen(PORT, async() => {
    console.log(`🚀 Servidor del restaurante corriendo en puerto ${PORT}`);
    await conectarBD();
});


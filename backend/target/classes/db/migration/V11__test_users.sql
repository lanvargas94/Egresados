-- Datos de prueba adicionales para desarrollo y testing

-- Usuario administrador GENERAL (ya existe en V10, pero lo actualizamos si es necesario)
-- Usuario: admin / Password: Admin12345
-- Ya creado en V10__admin_module.sql

-- Usuario administrador de PROGRAMA para pruebas
-- Usuario: admin.programa / Password: Programa123
-- NOTA: El hash se generará automáticamente por DataInitializer.java al iniciar la aplicación
-- Si necesitas crearlo manualmente, usa un generador BCrypt online o ejecuta:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hash = encoder.encode("Programa123");
INSERT INTO admin_users(id, username, password, nombre, correo, role, activo, creado_en)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'admin.programa',
    '$2a$10$rKjHV2WzO3nQr5sT6tX9v0wXxYzBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp', -- Hash temporal - se actualizará por DataInitializer
    'Admin Programa de Prueba',
    'admin.programa@corhuila.edu.co',
    'ADMIN_PROGRAMA',
    true,
    now()
) ON CONFLICT (username) DO UPDATE SET
    password = (SELECT password FROM admin_users WHERE username = 'admin.programa')
    WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin.programa' AND password LIKE '$2a$10$%');

-- Asignar programas al admin de programa
INSERT INTO admin_user_programas(admin_user_id, programa)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'Ingeniería de Sistemas'),
    ('00000000-0000-0000-0000-000000000002', 'Ingeniería Industrial')
ON CONFLICT DO NOTHING;

-- Actualizar datos de egresado de prueba 1 si no existen
INSERT INTO graduates (
    id,
    identificacion,
    nombre_legal,
    correo_personal,
    pais,
    ciudad,
    telefono_movil_e164,
    situacion_laboral,
    industria,
    empresa,
    cargo,
    aporte_mentoria,
    aporte_ofertas,
    aporte_conferencista,
    int_noticias_facultad,
    int_eventos_ciudad,
    int_ofertas_sector,
    int_posgrados,
    correo_verificado,
    consentimiento_datos,
    onboarding_completo,
    estado,
    creado_en,
    actualizado_en
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '1234567890',
    'Juan Pérez García',
    'juan.perez@ejemplo.com',
    'CO',
    'Neiva',
    '+573001234567',
    'EMPLEADO',
    'Tecnología',
    'Empresa Ejemplo S.A.S',
    'Desarrollador Senior',
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    'ACTIVO',
    NOW(),
    NOW()
) ON CONFLICT (identificacion) DO UPDATE SET
    estado = 'ACTIVO',
    onboarding_completo = true,
    correo_verificado = true,
    consentimiento_datos = true,
    actualizado_en = NOW();

-- Asegurar que el programa esté asociado
INSERT INTO programs (facultad, programa, anio, graduate_id)
VALUES (
    'Ingeniería',
    'Ingeniería de Sistemas',
    2020,
    '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT DO NOTHING;

-- Actualizar segundo usuario de prueba (sin onboarding completo)
INSERT INTO graduates (
    id,
    identificacion,
    nombre_legal,
    correo_verificado,
    consentimiento_datos,
    onboarding_completo,
    estado,
    creado_en,
    actualizado_en
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '9876543210',
    'María González López',
    false,
    false,
    false,
    'ACTIVO',
    NOW(),
    NOW()
) ON CONFLICT (identificacion) DO UPDATE SET
    estado = 'ACTIVO',
    actualizado_en = NOW();

INSERT INTO programs (facultad, programa, anio, graduate_id)
VALUES (
    'Ciencias Sociales',
    'Administración de Empresas',
    2019,
    '660e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT DO NOTHING;


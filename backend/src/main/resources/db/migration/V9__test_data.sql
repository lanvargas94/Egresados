-- Datos de prueba para desarrollo
-- Usuario de prueba para egresado

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
    NOW(),
    NOW()
) ON CONFLICT (identificacion) DO NOTHING;

-- Insertar programa de prueba
INSERT INTO programs (facultad, programa, anio, graduate_id)
VALUES (
    'Ingeniería',
    'Ingeniería de Sistemas',
    2020,
    '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT DO NOTHING;

-- Segundo usuario de prueba (sin onboarding completo)
INSERT INTO graduates (
    id,
    identificacion,
    nombre_legal,
    correo_verificado,
    consentimiento_datos,
    onboarding_completo,
    creado_en,
    actualizado_en
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '9876543210',
    'María González López',
    false,
    false,
    false,
    NOW(),
    NOW()
) ON CONFLICT (identificacion) DO NOTHING;

INSERT INTO programs (facultad, programa, anio, graduate_id)
VALUES (
    'Ciencias Sociales',
    'Administración de Empresas',
    2019,
    '660e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT DO NOTHING;




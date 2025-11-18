Frontend Angular (scaffold listo)

Requisitos
- Node.js 18+

Instalación y ejecución
1. `cd frontend`
2. `npm install`
3. `npm start` (sirve en `http://localhost:4200`)
   - Asegúrate de tener el backend en `http://localhost:8080` (o ajusta `src/environments/environment.ts`).

Rutas implementadas
- `/` Identificación por documento (POST `/api/auth/identify`)
- `/onboarding/step1` Paso 1 – Contacto (PUT `/api/onboarding/step1`)
- `/onboarding/step2` Paso 2 – Laboral (PUT `/api/onboarding/step2`)
- `/onboarding/step3` Paso 3 – Consentimiento (PUT `/api/onboarding/step3`)
- `/panel` Panel del egresado (placeholder)

Servicios
- `ApiService` (base URL en `environment.apiUrl`)
- `AuthService` (identify + storage de `graduateId`)
- `OnboardingService` (saveStep1/2/3)

Notas
- El scaffold usa componentes standalone y `provideRouter`.
- Ajusta estilos y validaciones según las reglas UI que definas.


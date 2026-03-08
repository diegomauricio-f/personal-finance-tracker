# Feature Specification: User Authentication & Cloud Database with Local Data Migration

**Feature Branch**: `005-user-auth-db-migration`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "agregar funcionalidades de base de datos, crear usuarios y que la data sea almacenada en una base de datos relacional, el usuario podrá iniciar sesión en cualquier dispositivo y su información no se quedará solamente en el dispositivo actual. Crear funciones que permitan realizar la migración de los datos locales a la base de datos, billeteras, registros."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Registro e inicio de sesión (Priority: P1)

Un usuario nuevo puede crear una cuenta con correo y contraseña. Un usuario existente puede iniciar sesión desde cualquier dispositivo y ver toda su información financiera sincronizada (billeteras, transacciones, categorías).

**Why this priority**: Sin autenticación no existe ninguna de las demás funcionalidades. Es el fundamento de todo lo demás.

**Independent Test**: Un usuario se registra, cierra sesión, inicia sesión desde otro navegador y ve sus datos correctamente. Entrega valor completo sin necesitar la migración local.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** completa el formulario de registro con email y contraseña válidos, **Then** se crea su cuenta y accede automáticamente a la aplicación con sus datos vacíos.
2. **Given** un usuario registrado, **When** ingresa sus credenciales correctas, **Then** accede a su información financiera personal.
3. **Given** un usuario que intenta registrarse con un email ya existente, **When** envía el formulario, **Then** recibe un mensaje de error claro indicando que el correo ya está en uso.
4. **Given** un usuario que ingresa credenciales incorrectas, **When** intenta iniciar sesión, **Then** recibe un mensaje de error sin revelar cuál campo es incorrecto.
5. **Given** un usuario autenticado, **When** cierra sesión, **Then** es redirigido al login y no puede acceder a rutas protegidas sin autenticarse de nuevo.

---

### User Story 2 — Migración de datos locales a la nube (Priority: P2)

Un usuario que ya tiene datos almacenados localmente en su dispositivo (billeteras, transacciones, categorías) puede migrar toda esa información a su cuenta en la nube, de modo que no pierda su historial al activar la sincronización.

**Why this priority**: Hay usuarios actuales con datos en localStorage. Sin migración, perderían toda su información al activar el sistema de cuentas, lo que generaría fricción y abandono.

**Independent Test**: Un usuario con datos locales preexistentes completa el proceso de migración y verifica que todas sus billeteras y transacciones aparecen en su cuenta cloud.

**Acceptance Scenarios**:

1. **Given** un usuario recién registrado o recién autenticado con datos en el dispositivo local, **When** el sistema detecta datos locales, **Then** se le presenta una pantalla de migración con un resumen de los datos encontrados (X billeteras, Y transacciones).
2. **Given** la pantalla de migración, **When** el usuario confirma la migración, **Then** todos los datos locales (billeteras, transacciones, categorías personalizadas) se transfieren a su cuenta en la base de datos.
3. **Given** que la migración se completó, **When** el usuario revisa su cuenta, **Then** todos los registros migrados están visibles y correctamente asociados a su cuenta.
4. **Given** un usuario que decide no migrar, **When** descarta la pantalla de migración, **Then** la aplicación funciona normalmente con sus datos en la nube (vacíos) y los datos locales permanecen intactos en el dispositivo.
5. **Given** un error durante la migración, **When** ocurre un fallo parcial, **Then** el sistema informa al usuario qué datos se migraron y cuáles no, sin corromper ninguno de los dos.

---

### User Story 3 — Sincronización en tiempo real entre dispositivos (Priority: P3)

Un usuario autenticado ve sus datos financieros actualizados en cualquier dispositivo donde inicie sesión. Al agregar una transacción desde el móvil, esta aparece inmediatamente al abrir la app en otro dispositivo.

**Why this priority**: Es el beneficio final de tener base de datos en la nube. Requiere que P1 (auth) y el backend estén funcionando.

**Independent Test**: El usuario crea una transacción en el dispositivo A, abre la app en el dispositivo B y ve la transacción sin recargar manualmente.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con la app abierta en dos dispositivos, **When** crea una transacción en el dispositivo A, **Then** la transacción aparece en el dispositivo B en menos de 5 segundos sin acción del usuario.
2. **Given** un usuario sin conexión a internet, **When** agrega una transacción, **Then** el dato se guarda localmente y se sincroniza automáticamente cuando se restaura la conexión.
3. **Given** un usuario que accede desde un dispositivo nuevo, **When** inicia sesión, **Then** ve toda su historia financiera completa inmediatamente.

---

### Edge Cases

- ¿Qué sucede si el usuario tiene datos locales Y datos en la nube (ya migró desde otro dispositivo)? → El sistema detecta que ya existe información en la nube y pregunta si desea combinar o ignorar los datos locales.
- ¿Qué ocurre si la migración falla a mitad de proceso? → Se mantiene la integridad: o se migra todo o no se migra nada (transacción atómica).
- ¿Qué pasa si el usuario cierra la app durante la migración? → Al volver a abrir, se detecta la migración incompleta y se ofrece reintentar.
- ¿Qué sucede con categorías predefinidas durante la migración? → No se duplican; solo se migran las categorías personalizadas.
- ¿El usuario puede usar la app sin estar autenticado? → No. El registro es obligatorio. Todos los usuarios deben tener una cuenta para acceder a la aplicación.

---

## Requirements *(mandatory)*

### Functional Requirements

**Autenticación**
- **FR-001**: El sistema DEBE permitir a usuarios nuevos crear una cuenta con correo electrónico y contraseña.
- **FR-002**: El sistema DEBE validar que el correo tenga formato válido y que la contraseña cumpla requisitos mínimos de seguridad (mínimo 8 caracteres).
- **FR-003**: El sistema DEBE permitir a usuarios existentes iniciar sesión con sus credenciales.
- **FR-004**: El sistema DEBE mantener la sesión activa entre visitas sin requerir re-autenticación frecuente.
- **FR-005**: El sistema DEBE permitir cerrar sesión de forma explícita.
- **FR-006**: El sistema DEBE proteger todas las rutas de la aplicación, redirigiendo usuarios no autenticados al login.
- **FR-007**: El sistema DEBE ofrecer recuperación de contraseña vía correo electrónico.

**Almacenamiento en la nube**
- **FR-008**: Todos los datos del usuario (billeteras, transacciones, categorías) DEBEN almacenarse en una base de datos relacional en el servidor.
- **FR-009**: Los datos de cada usuario DEBEN estar aislados; ningún usuario puede acceder a los datos de otro.
- **FR-010**: El sistema DEBE sincronizar automáticamente los datos del usuario al iniciar sesión desde cualquier dispositivo.

**Migración de datos locales**
- **FR-011**: El sistema DEBE detectar automáticamente si existen datos en el almacenamiento local del dispositivo al iniciar sesión.
- **FR-012**: El sistema DEBE mostrar un resumen de los datos locales encontrados (cantidad de billeteras, transacciones, categorías) antes de iniciar la migración.
- **FR-013**: El sistema DEBE transferir billeteras, transacciones y categorías personalizadas al cuenta del usuario en la nube.
- **FR-014**: La migración DEBE ser atómica: si falla, no deben quedar datos parcialmente migrados.
- **FR-015**: El sistema DEBE ofrecer al usuario la opción de no migrar y continuar con datos en la nube (vacíos o existentes).
- **FR-016**: Tras una migración exitosa, los datos locales DEBEN marcarse como migrados para evitar duplicaciones en migraciones futuras.

### Key Entities

- **Usuario**: Identidad con credenciales, correo único, fecha de registro y preferencias de configuración (idioma, moneda).
- **Sesión**: Token de acceso asociado a un usuario y dispositivo, con fecha de expiración.
- **Billetera** (ya existe): Asociada a un usuario específico; incluye nombre y saldo calculado.
- **Transacción** (ya existe): Asociada a un usuario y una billetera; incluye monto, tipo, categoría, fecha y nota.
- **Categoría** (ya existe): Puede ser predefinida (global) o personalizada (por usuario).
- **Registro de migración**: Metadato que indica si los datos locales de un dispositivo ya fueron migrados y cuándo.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar el registro e inicio de sesión en menos de 2 minutos.
- **SC-002**: Un usuario autenticado ve sus datos sincronizados en un nuevo dispositivo en menos de 3 segundos tras iniciar sesión.
- **SC-003**: El proceso de migración de datos locales completa en menos de 30 segundos para un historial de hasta 1.000 transacciones.
- **SC-004**: El 100% de los datos locales (billeteras, transacciones, categorías personalizadas) están disponibles en la nube tras una migración exitosa.
- **SC-005**: Ningún dato de un usuario es accesible por otro usuario en ninguna circunstancia.
- **SC-006**: La aplicación sigue siendo funcional con conectividad limitada; los datos se sincronizan automáticamente al recuperar la conexión.

---

## Assumptions

- El proveedor de base de datos relacional y el backend serán seleccionados en la fase de planificación técnica, no en esta especificación.
- La autenticación usará email + contraseña como método principal (no se requiere OAuth social por ahora).
- Las categorías predefinidas del sistema (no personalizadas por el usuario) no se migran porque ya existen en el servidor.
- El registro es obligatorio. No existe modo local sin cuenta; los usuarios deben autenticarse para usar la aplicación.
- La sincronización entre dispositivos puede tener una latencia de hasta 5 segundos (no se requiere colaboración en tiempo real).
- La aplicación actualmente almacena datos en localStorage del navegador; la migración leerá directamente desde ahí.

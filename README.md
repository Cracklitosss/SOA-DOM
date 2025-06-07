# Microservicio de Grupos y Eventos

Este microservicio gestiona grupos sociales y eventos, utilizando arquitectura hexagonal y Domain-Driven Design (DDD).

## Estructura del Proyecto

El proyecto sigue la arquitectura hexagonal:

- **domain/**: Contiene el núcleo de la lógica de negocio
  - **aggregates/**: Raíces de agregado (Grupo, Evento)
  - **entities/**: Entidades de dominio
  - **value-objects/**: Objetos de valor inmutables
  - **events/**: Eventos de dominio y publisher
  - **services/**: Servicios de dominio
  - **repositories/**: Interfaces de repositorio

- **application/**: Orquesta casos de uso
  - **dto/**: Objetos de transferencia de datos
  - **ports/**: Puertos de entrada y salida
  - **services/**: Implementación de casos de uso

- **infrastructure/**: Implementaciones técnicas
  - **config/**: Configuración de infraestructura
  - **persistence/**: Implementaciones de repositorios

- **interfaces/**: Adaptadores para comunicación externa
  - **rest/**: API REST y controladores

## API REST

### Grupos

- **GET /api/grupos**: Listar todos los grupos
- **GET /api/grupos/:id**: Obtener grupo por ID
- **POST /api/grupos**: Crear un nuevo grupo
- **PUT /api/grupos/:id**: Actualizar un grupo
- **DELETE /api/grupos/:id**: Eliminar un grupo

### Miembros de Grupo

- **GET /api/grupos/:id/miembros**: Listar miembros de un grupo
- **POST /api/grupos/:id/miembros**: Agregar miembro a un grupo
- **DELETE /api/grupos/:grupoId/miembros/:usuarioId**: Eliminar miembro de un grupo
- **PUT /api/grupos/:grupoId/miembros/:usuarioId/rol**: Cambiar rol de un miembro

### Publicaciones de Grupo

- **GET /api/grupos/:id/publicaciones**: Listar publicaciones de un grupo
- **POST /api/grupos/:id/publicaciones**: Crear publicación en un grupo
- **PUT /api/grupos/:grupoId/publicaciones/:publicacionId/aprobar**: Aprobar publicación
- **PUT /api/grupos/:grupoId/publicaciones/:publicacionId/rechazar**: Rechazar publicación

### Eventos

- **GET /api/eventos**: Listar todos los eventos
- **GET /api/eventos/:id**: Obtener evento por ID
- **POST /api/eventos**: Crear un nuevo evento
- **PUT /api/eventos/:id**: Actualizar un evento
- **DELETE /api/eventos/:id**: Eliminar un evento

### Asistentes a Eventos

- **GET /api/eventos/:id/asistentes**: Listar asistentes a un evento
- **POST /api/eventos/:id/asistentes**: Invitar usuario a un evento
- **PUT /api/eventos/:id/respuesta**: Registrar respuesta a invitación

### Otras Rutas

- **GET /api/eventos/proximos/:dias?**: Listar eventos próximos (por defecto 30 días)
- **GET /api/grupos/:grupoId/eventos**: Listar eventos de un grupo
- **GET /api/usuarios/:usuarioId/eventos**: Listar eventos de un usuario
- **GET /api/usuarios/:usuarioId/grupos**: Listar grupos de un usuario

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Configurar base de datos
# Editar el archivo .env con los datos de conexión

# Iniciar el servidor en modo desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Iniciar el servidor en producción
npm start
```

## Base de Datos

El microservicio utiliza MySQL. Para inicializar la base de datos, utilice el script en `infrastructure/config/init-db.sql`.

## Tecnologías Utilizadas

- TypeScript
- Express.js
- MySQL
- Domain-Driven Design
- Arquitectura Hexagonal

## Autenticación

Para las operaciones que requieren autenticación, se debe incluir el header `x-usuario-id` con el ID del usuario.

## Eventos de dominio

Los eventos de dominio son simulados en este proyecto. Se pueden ver en la consola cuando se realizan acciones como crear grupos, unirse a grupos, crear eventos, etc.

## Pruebas

Para ejecutar las pruebas:

```bash
npm test
```

## Diseño DDD

El diseño del dominio sigue los principios de DDD:

- **Agregados**: Grupo y Evento son los agregados principales
- **Entidades**: MiembroGrupo, PublicacionGrupo, AsistenteEvento
- **Objetos de Valor**: GrupoId, EventoId, UsuarioId, PrivacidadGrupo, RolGrupo, etc.
- **Servicios de Dominio**: GrupoService, EventoService
- **Eventos de Dominio**: GrupoCreado, UsuarioUnidoAGrupo, EventoCreado, etc.

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama para la nueva funcionalidad
3. Enviar un pull request 
# WASM HTTP Server con Hono

Servidor HTTP implementado como componente WebAssembly (WASM) usando TypeScript y el framework Hono, compilado como componente WASI.

## Descripcion

Este proyecto demuestra cómo crear un servidor HTTP funcional en WebAssembly usando:

- **TypeScript** como lenguaje de desarrollo
- **Hono** como framework web minimalista
- **WASM Components** como formato de distribución
- **WASI HTTP 0.2.6** como interfaz estándar para manejo de solicitudes HTTP

El componente resultante es portable y puede ejecutarse en cualquier runtime compatible con WASI (Wasmtime, WasmCloud, etc.).

## Requisitos Previos

- **Node.js** >= 18
- **pnpm** >= 10.28.2

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd wasm

# Instalar dependencias
pnpm install
```

## Estructura del Proyecto

```
.
├── src/
│   └── component.ts          # Código fuente principal (aplicación Hono)
├── wit/
│   ├── component.wit         # Definición de interfaz del componente
│   └── deps/                 # Dependencias WASI (http, clocks, io, cli, random)
├── generated/
│   └── types/                # Tipos TypeScript generados desde WIT
├── dist/
│   ├── component.js          # JavaScript compilado
│   └── component.wasm        # Componente WebAssembly final
├── package.json
├── tsconfig.json
└── rolldown.config.mjs       # Configuración del bundler
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run gen:types` | Genera tipos TypeScript desde las definiciones WIT |
| `pnpm run build:ts` | Compila TypeScript a JavaScript usando Rolldown |
| `pnpm run build:component` | Convierte JavaScript a componente WASM |
| `pnpm run build` | Ejecuta todos los pasos de compilación |
| `pnpm run serve` | Sirve el componente WASM compilado |
| `pnpm run transpile` | Transpila el componente a JavaScript standalone |
| `pnpm run demo` | Ejecuta la demo del proyecto |
| `pnpm run all` | Compila y ejecuta la demo |

## Proceso de Compilación

El proyecto utiliza un pipeline de compilación en tres etapas:

```
src/component.ts → [Rolldown] → dist/component.js → [jco componentize] → dist/component.wasm
```

1. **Generación de tipos**: `jco guest-types` genera tipos TypeScript desde las definiciones WIT
2. **Bundling**: Rolldown compila y empaqueta TypeScript a JavaScript (formato ESM)
3. **Componentización**: `jco componentize` convierte el JavaScript en un componente WASM estándar

## Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/hello` | Retorna un mensaje JSON de bienvenida |
| POST | `/post` | Retorna un mensaje JSON confirmando solicitud POST |
| POST | `/users` | Realiza fetch a API externa y retorna usuarios |

### Ejemplos de Uso

```bash
# GET /hello
curl http://localhost:8080/hello
# Respuesta: {"message":"Hello from WebAssembly!"}

# POST /post
curl -X POST http://localhost:8080/post
# Respuesta: {"message":"POST request from WebAssembly!"}

# POST /users
curl -X POST http://localhost:8080/users
# Respuesta: Lista de usuarios desde jsonplaceholder
```

### Probar con Wasmtime

[Wasmtime](https://wasmtime.dev/) es un runtime de WebAssembly que soporta WASI. Para ejecutar el componente HTTP con wasmtime:

```bash
# Instalar wasmtime (si no está instalado)
curl https://wasmtime.dev/install.sh -sSf | bash

# Compilar el componente
pnpm run build

# Ejecutar el servidor con wasmtime serve
wasmtime serve dist/component.wasm --addr 0.0.0.0:8080 -S cli=y -S inherit-network=y

# En otra terminal, probar los endpoints
curl http://localhost:8080/hello
```

El comando `wasmtime serve` inicia un servidor HTTP que enruta las solicitudes al handler exportado por el componente WASM.

> [!NOTE]
> Los endpoints que realizan requests HTTP salientes (como `/users`) pueden no funcionar correctamente con `wasmtime serve` debido a limitaciones en la capa > de red de WASI. Los endpoints síncronos como `/hello` y `/post` funcionan sin problemas.

## Arquitectura

### WebAssembly Interface Types (WIT)

El componente exporta un manejador HTTP WASI estándar definido en `wit/component.wit`:

```wit
package example:hono;

world component {
    export wasi:http/incoming-handler@0.2.6;
}
```

### Dependencias WASI

El proyecto utiliza las siguientes interfaces WASI 0.2.6:

- **wasi:http** - Manejo de solicitudes/respuestas HTTP entrantes y salientes
- **wasi:clocks** - Acceso al reloj monotónico
- **wasi:io** - Streams y manejo de errores
- **wasi:cli** - Interacción de línea de comandos
- **wasi:random** - Generación de números aleatorios

## Tecnologías Principales

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| TypeScript | ^5.9.3 | Lenguaje de desarrollo |
| Hono | ^4.11.7 | Framework web minimalista |
| Rolldown | 1.0.0-rc.1 | Bundler de módulos |
| @bytecodealliance/jco | ^1.15.4 | CLI para componentes WASM |
| @bytecodealliance/componentize-js | ^0.19.3 | Conversión JS a WASM |

## Cómo Funciona

1. **Hono** define las rutas HTTP y sus handlers en TypeScript
2. **Rolldown** empaqueta el código TypeScript en un único archivo JavaScript
3. **jco componentize** toma el JavaScript y lo convierte en un componente WASM
4. El adaptador `@bytecodealliance/jco-std` conecta Hono con la interfaz WASI HTTP
5. El componente WASM exporta `incomingHandler` que el runtime WASI utiliza para enrutar solicitudes

## Licencia

MIT
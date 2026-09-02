# Memoria bajo influencia

Aplicación web para pilotear la práctica **Efecto de la información postevento sobre la memoria inmediata y diferida**. Fue construida para el Equipo 5 del curso Investigación en Psicología y Neurociencias.

**Aplicación publicada:** <https://hromo-parra.github.io/memoria-bajo-influencia/>

Autoras del protocolo:

- Mariana Rodríguez Martínez
- María Fernanda Negrete Martín del Campo

## Qué incluye

- Modo participante y modo docente.
- Consentimiento informado previo a la sesión inicial, con registro de fecha y versión.
- Una sola reproducción del video del evento.
- Doce ejercicios visuales distractores.
- Tres listas de información postevento con rotación C/E/N.
- Seis versiones que contrabalancean Forma A, Forma B y lista.
- Pruebas secuenciales sin retroalimentación ni navegación hacia atrás.
- Registro de respuesta, confianza, fuente atribuida y latencia.
- Seguimiento bloqueado durante siete días, salvo en modo piloto.
- Debriefing después de la segunda sesión.
- Exportación de datos en CSV y respaldo/importación en JSON.

## Arquitectura

El proyecto usa HTML, CSS y JavaScript sin frameworks ni proceso de compilación:

```text
.
├── index.html                 # Estructura y punto de entrada
├── styles.css                # Sistema visual y diseño responsive
├── data.js                   # Detalles, condiciones, preguntas y claves
├── app.js                    # Flujo experimental, almacenamiento y exportación
├── assets/
│   └── evento-cafeteria.mp4   # Estímulo audiovisual
├── .nojekyll                 # Compatibilidad directa con GitHub Pages
└── README.md
```

La separación de `data.js` y `app.js` permite revisar el contenido científico sin modificar la presentación o la lógica de navegación.

## Ejecutar localmente

No se requieren dependencias. Desde esta carpeta:

```bash
python3 -m http.server 8010
```

Abre `http://localhost:8010` en un navegador moderno. No abras `index.html` directamente, porque algunos navegadores restringen el video y las descargas cuando se usa el protocolo `file://`.

## Modo docente

La clave inicial de pilotaje es `MEMORIA2026`. Permite:

- activar o desactivar el modo piloto;
- calcular la asignación reproducible de un código;
- revisar el balance de condiciones y formas;
- exportar CSV/JSON e importar respaldos;
- borrar los datos locales con doble confirmación.

Esta clave aparece en el código fuente y **no es una medida de seguridad**. GitHub Pages publica todos los archivos del repositorio.

## Asignación experimental

Cada código anónimo se transforma de manera determinista en una de seis versiones mediante la semilla `MEMORIA-2026-v01`.

| Versión | Inmediata | Diferida | Lista |
|---|---|---|---|
| V1 | A | B | 1 |
| V2 | A | B | 2 |
| V3 | A | B | 3 |
| V4 | B | A | 1 |
| V5 | B | A | 2 |
| V6 | B | A | 3 |

La asignación por hash conserva la versión de un código, pero no garantiza por sí sola bloques completos V1–V6 en el orden de reclutamiento. Para el estudio definitivo, el equipo debe generar previamente la secuencia aleatoria por bloques y administrar los códigos desde un servidor o una lista maestra.

## Datos exportados

Cada fila del CSV corresponde a un reactivo e incluye:

- `participant_code`, `consent_at`, `consent_version`, `version`, `list`, `session`, `form`;
- `item_id`, `condition`, `response`;
- `accuracy`, `misinfo_choice`, `misinfo_accept`;
- `confidence_0_100`, `source`, `rt_ms`;
- `no_recall`, `filler`, `status`, `inconsistency_flag`.

Reglas incorporadas:

- “No lo recuerdo” es una respuesta válida y se codifica por separado.
- Una omisión deliberada se registra como `NA_OMIT`.
- F01 se marca como relleno y sus puntuaciones principales quedan vacías.
- Una respuesta concreta con fuente “No recuerda” activa `inconsistency_flag` sin modificar la respuesta.

Las respuestas abiertas se codifican con las variantes aceptables descritas en la matriz. Las respuestas ambiguas aún requieren revisión ciega por dos evaluadores; el prototipo no sustituye esa verificación humana.

## Publicar en GitHub Pages

1. Crea un repositorio y sube el contenido de esta carpeta a la rama `main`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda y espera a que GitHub muestre la URL pública.

No se necesita un workflow ni una compilación. Las rutas y el video usan referencias relativas compatibles con una URL de proyecto como `usuario.github.io/nombre-del-repositorio/`.

## Limitaciones metodológicas y de privacidad

Esta versión está diseñada para **docencia y pilotaje local**, no para recolectar una muestra real sin modificaciones:

1. GitHub Pages no incluye una base de datos privada. Los datos se conservan en `localStorage` del navegador.
2. El acceso docente y las claves de corrección son visibles en el código publicado.
3. El seguimiento funciona automáticamente en el mismo navegador. Si se cambia de dispositivo, es necesario importar el respaldo JSON.
4. La sesión inicial exige consentimiento informado antes de mostrar el estímulo y registra fecha y versión. Antes de recolectar datos reales siguen siendo necesarias la aprobación institucional o del comité de ética y una vía formal de contacto para participantes.
5. Deben definirse retención, cifrado, control de acceso, retiro de datos e incidencias antes de reclutar participantes.
6. La matriz fue contrastada visualmente con el video, pero la visibilidad y dificultad de cada detalle deben confirmarse mediante pilotaje independiente.

Para recolección real se recomienda mantener esta interfaz y trasladar asignaciones, claves y respuestas a un backend privado con autenticación y registro de auditoría.

## Verificación antes de usar

- Probar el flujo completo en escritorio y teléfono.
- Pilotear las Formas A y B con personas fuera de la muestra final.
- Comparar dificultad, tiempo medio y tasa de omisión entre formas.
- Confirmar que cada detalle crítico sea inequívoco en el video.
- Verificar que no haya retroalimentación antes del debriefing.
- Exportar un CSV de prueba y revisar sus columnas.
- Desactivar el modo piloto antes de cualquier aplicación formal.

## Versión

Prototipo `v0.1.0`, 26 de agosto de 2026.

# Contrato de importación

## Entrada aceptada

Fase 6A acepta un único archivo `.json` que represente directamente un `PublicPresentationDocument`. No acepta SourcePresentationDocument, backups, estados de Studio, ZIP, carpetas, URLs remotas ni texto ejecutable.

Condiciones de frontera:

- máximo 5 MiB medidos desde `File.size` y nuevamente desde los bytes leídos;
- UTF-8 estricto, con BOM opcional retirado antes del análisis;
- extensión `.json`; MIME permitido `application/json` o vacío por limitaciones de navegadores;
- un objeto JSON raíz, no lista ni valor primitivo;
- profundidad, cantidad de claves, escenas, bloques y longitudes sujetas a límites contractuales;
- lectura local sin enviar datos a Internet.

El MIME orienta, pero no sustituye la validación del contenido.

## Flujo contractual

```text
File
→ comprobar nombre, tipo y tamaño
→ leer ArrayBuffer
→ decodificar UTF-8
→ JSON.parse
→ inspeccionar árbol JSON seguro
→ validatePublicPresentation en modo estricto
→ comprobar compatibilidad
→ convertir a Source
→ validateSourcePresentation
→ devolver clon aislado
```

Cada etapa puede cancelarse. `destroy()` invalida operaciones pendientes y elimina referencias al archivo, texto, bytes y documento.

## Validación y seguridad

La inspección previa rechaza:

- claves `__proto__`, `prototype` o `constructor` en cualquier nivel;
- funciones, símbolos, valores no finitos o tipos que no pertenecen a JSON en entradas programáticas;
- campos privados `presenter`, `editorial`, `history` o `privateData`;
- campos desconocidos no autorizados;
- HTML arbitrario, scripts, manejadores `on*`, URLs `javascript:` y rutas locales absolutas;
- referencias circulares en entradas programáticas;
- estructuras que excedan límites antes de una conversión costosa.

Las extensiones `x-*` solo se admiten si el contrato y una política registrada las reconocen. En importación, un campo desconocido no reconocido es bloqueante aunque otros validadores lo traten como advertencia.

La protección no depende de fusionar objetos. La normalización construye objetos nuevos mediante listas permitidas; nunca usa `Object.assign` sobre datos externos ni los mezcla con prototipos.

## Compatibilidad

| Caso | Resultado |
|---|---|
| `contractVersion` mayor compatible y comprendida | aceptar |
| major contractual diferente | `contract-version-incompatible` |
| `minimumEngineVersion` superior al motor | `engine-too-old` |
| `maximumEngineVersion` inferior al motor | `engine-too-new` |
| versión antigua con migrador aprobado | migrar en memoria y volver a validar |
| versión antigua sin migrador | `migration-unavailable` |
| tipo de escena, bloque, layout o tema no registrado | documento incompatible |

La importación nunca intenta “arreglar” silenciosamente un documento incompatible. Explica versión encontrada, rango admitido y acción segura disponible.

## Conversión público → borrador fuente

`PublicToSourceConverter` recibe únicamente un documento público ya validado:

1. clona y normaliza campos públicos permitidos;
2. conserva `id`, versión, escenas, bloques, orden, tema, derechos y referencias válidas;
3. genera una `draftKey` local separada mediante un generador inyectado;
4. añade datos privados mínimos bajo `editorial.studio`, como origen `import`, fecha de importación y versión de esquema fuente;
5. inicializa notas privadas, historial temporal y selección fuera del documento cuando corresponda;
6. actualiza `updatedAt` solo mediante una decisión explícita del contrato de conversión;
7. valida el Source resultante;
8. devuelve clones defensivos sin referencias al objeto importado.

Importar dos veces el mismo documento produce dos registros locales distintos. El `id` contractual se conserva; `draftKey` impide colisiones de almacenamiento. Renombrar el título tampoco cambia automáticamente ninguno de los dos IDs.

## Errores

El resultado usa `{ ok, value?, diagnostics }`. Cada diagnóstico contiene:

- `code`;
- `path`;
- `message` comprensible;
- `severity`;
- contexto limitado, como tamaño o versión esperada.

No incluye fragmentos extensos, notas privadas, rutas completas del equipo ni el archivo original. La UI acumula problemas y permite seleccionar otro archivo; nunca abre Studio ni escribe almacenamiento cuando hay errores.

## Aislamiento

Después de importar:

- mutar el borrador no altera el documento analizado;
- mutar el objeto de resultado entregado a la UI no altera la copia preparada para el repositorio;
- se liberan bytes y texto tan pronto termina la operación;
- el archivo original nunca se modifica;
- guardar requiere una acción posterior explícita del usuario.

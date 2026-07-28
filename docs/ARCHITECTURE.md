# Arquitectura

## Límites

NEXUS separa motor, presentación, tema y recursos. El motor no depende de la demostración; cualquier documento válido debe poder cargarse sin modificar el núcleo.

```text
src/
  core/            ciclo de vida, estado y eventos
  contracts/       validación de documentos y escenas
  presentation/    carga de datos estructurados
  scenes/          tipos de escena registrados
  navigation/      transiciones y progreso global
  media/           carga y liberación de recursos
  presenter/       notas y datos privados de presentación
  accessibility/   foco, semántica y preferencias
  storage/         preferencias encapsuladas
  pwa/             manifest, caché y actualización futuros
  ui/              controles de interfaz
  styles/          tokens, temas y componentes
tests/             pruebas no productivas por área
```

Estas carpetas son futuras: no se crean hasta contener archivos reales.

## Reglas

- HTML mínimo y semántico; sin JavaScript o CSS extensos incrustados.
- Cada archivo queda bajo 400 líneas y una responsabilidad.
- No hay dependencias circulares ni módulos acumuladores.
- Componentes visuales no acceden a almacenamiento directamente.
- El estado global mínimo contiene documento, escena activa, carga, conectividad y preferencias.
- Eventos tienen nombre, origen y carga documentados; las escenas no controlan navegación global.
- Recursos se declaran en el documento, se cargan progresivamente y se liberan al salir.

## Presentador y temas

Notas, escena actual, siguiente escena, reloj y controles pertenecen a `presenter/`. La segunda ventana es futura, pero el contrato reserva esos datos. Los temas exponen tokens; las escenas no definen identidad global.

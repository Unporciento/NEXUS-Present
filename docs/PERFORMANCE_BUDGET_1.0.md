# Presupuesto de rendimiento 1.0 RC

Los valores son presupuestos de ingeniería, no garantías universales. Se mide primero en servidor HTTP local, navegador de escritorio y datos sintéticos.

| Operación | Presupuesto RC | Estrategia |
|---|---:|---|
| HTML + CSS + JS inicial sin assets | ≤ 350 KiB transferidos sin caché | módulos estáticos, sin fuentes ni CDN |
| Interfaz interactiva local | ≤ 1.5 s en escritorio de referencia | módulos pequeños, sin build framework |
| Cambio de escena sin media | p95 ≤ 50 ms local | navegación síncrona y un renderer |
| Apertura de Biblioteca con 100 borradores | ≤ 500 ms local | índice por modificación, vista resumida |
| Importación JSON de 5 MiB | ≤ 1 s local | límite antes de lectura y validación única |
| Exportación ZIP sin assets | ≤ 1 s local | compresión síncrona limitada y estado visible |
| Memoria temporal de paquete | ≤ 2.5× tamaño expandido | límites, liberación de referencias y descarga inmediata |
| Object URLs activas | solo escena actual | ObjectUrlPool y release/destroy |

La Fase 7 midió la ruta de navegación antes y después; la diferencia de microsegundos se trató como ruido y no como mejora universal. Fase 9 registra tamaño real del build y del ZIP en `RELEASE_CANDIDATE_REPORT.md`.

## Medición local de la RC

Referencia: servidor HTTP local, navegador de escritorio y documentos sintéticos, sin red pública. Son observaciones reproducibles del equipo usado, no promesas para otros dispositivos.

| Medición | Muestras | Mediana | p95 observado |
|---|---:|---:|---:|
| Apertura HTTP de Biblioteca | 10 | 12,20 ms | 75,29 ms |
| Navegación sin multimedia | 500 | 0,0015 ms | 0,0056 ms |
| ZIP portable sin assets | 10 | 2,88 ms | 4,61 ms |

El build estático contiene 77 archivos y ocupa 240.001 bytes. El ZIP de la candidata ocupa 97.034 bytes. Las cifras extremadamente pequeñas de navegación miden únicamente la operación síncrona aislada; no representan pintura, decodificación multimedia ni latencia de dispositivo.

Pestaña oculta pausa videos gestionados y las transiciones se cancelan. No hay animación permanente, precarga completa de video ni transcodificación. Los assets no forman parte de la carga inicial hasta ser usados.

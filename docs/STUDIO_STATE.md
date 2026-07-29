# Estado propuesto de Studio

| Campo | Clasificación | Propósito |
|---|---|---|
| documento | persistente futuro / privado | SourcePresentationDocument |
| escena y bloque seleccionados | temporal | foco de edición |
| cambios pendientes | derivado | diferencia frente al último guardado futuro |
| validación | derivada | resultado de contratos existentes |
| modo preview | temporal | edición o previsualización |
| historial | temporal y privado | snapshots limitados |
| exportación | temporal | idle, exporting, exported, error |

Estados UI: vacío, nuevo, editando, cambios sin guardar, válido, inválido, previsualizando, error de preview, exportando, exportado y error de exportación. Cada estado conserva acciones visibles: crear, corregir, previsualizar, exportar o volver a editar según corresponda.

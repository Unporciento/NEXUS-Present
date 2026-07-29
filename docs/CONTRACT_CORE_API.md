# API contractual de Fase 2

`validateSourcePresentation` y `validatePublicPresentation` validan documentos sin efectos secundarios. `validateScene` y `validateAssets` comprueban registros, bloques, referencias y rutas. `createPublicPresentation` transforma Source en Public de forma determinista y sin mutar la entrada.

`checkEngineCompatibility` aplica SemVer. `registerSceneType` y `getSceneType` administran un registro cerrado y extensible. Los diagnósticos devuelven `code`, `path`, `message`, `severity` y contexto opcional.

No existe interfaz, Player, Publisher real, persistencia ni publicación en esta fase.

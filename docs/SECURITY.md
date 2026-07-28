# Seguridad y privacidad

- Sin backend, cuentas, nube, sincronización ni telemetría en V1.
- Datos locales solo con necesidad demostrada; componentes visuales usan una capa de almacenamiento, nunca APIs directas.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- Dependencias externas requieren justificación, versión fijada y revisión.
- La futura CSP bloqueará ejecución dinámica, scripts no autorizados y orígenes innecesarios.
- Archivos de usuario se validarán por tipo, tamaño y formato; nunca se ejecutan.
- Recursos externos usan URLs permitidas y no reciben datos del usuario sin consentimiento.
- Hallazgos sensibles se reportan de forma privada.

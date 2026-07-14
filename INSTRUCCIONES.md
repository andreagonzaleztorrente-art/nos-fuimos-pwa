# ¡Nos Fuimos! — Instalación como app (PWA)

Esta carpeta convierte tu app de Apps Script en algo instalable en el celular, con ícono propio, sin pasar por ninguna tienda. Son 4 pasos.

## Paso 1 — Conseguir la URL de tu app (la que termina en /exec)

1. Abrí tu hoja de cálculo de Google Sheets (o directamente script.google.com).
2. Si estás en Sheets: menú **Extensiones > Apps Script**.
3. Arriba a la derecha, botón **Implementar > Administrar implementaciones** ("Deploy > Manage deployments").
4. Ahí vas a ver una URL bajo "Web app" que termina en `/exec`. Copiala completa.

Si nunca implementaste la app como "Web app", primero hacé **Implementar > Nueva implementación**, tipo "Aplicación web", acceso "Cualquier usuario", y ahí Google te da esa URL.

## Paso 2 — Permitir que se embeba (importante)

Por seguridad, Apps Script a veces bloquea que su contenido se muestre dentro de un iframe (como hace este shell). Para evitarlo, en tu archivo `.gs` donde tenés la función `doGet()`, agregá esta línea antes del `return`:

```javascript
return HtmlService.createTemplateFromFile('index')
  .evaluate()
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

Si tu `doGet()` ya usa `.evaluate()`, solo agregá `.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)` al final de la cadena. Después, volvé a **Implementar > Administrar implementaciones** y creá una **Nueva versión** para que el cambio se aplique (igual que hiciste con el bug del dropdown).

## Paso 3 — Completar y subir esta carpeta

1. Abrí el archivo `index.html` de esta carpeta.
2. Buscá el texto `PEGAR_URL_AQUI` y reemplazalo por la URL que copiaste en el Paso 1.
3. Subí toda la carpeta (`index.html`, `manifest.json`, `service-worker.js`, `icons/`) a **GitHub Pages** (gratis):
   - Creá una cuenta en github.com si no tenés.
   - Creá un repositorio nuevo (puede ser privado o público).
   - Subí los archivos de esta carpeta manteniendo la subcarpeta `icons/`.
   - En el repositorio: **Settings > Pages > Source: main branch**, guardar.
   - GitHub te da una URL tipo `https://tu-usuario.github.io/nombre-repo/`.

(Si preferís, puedo explicarte Firebase Hosting como alternativa — la idea es la misma, solo cambia dónde se aloja.)

## Paso 4 — Instalar en los celulares de la familia

- **Android (Chrome):** entrar a la URL de GitHub Pages → aparece un cartel "Agregar a pantalla de inicio" (o menú ⋮ > Instalar app).
- **iPhone (Safari):** entrar a la URL → botón Compartir (cuadrado con flecha) → "Agregar a inicio". iOS no muestra el cartel automático, hay que hacerlo manual la primera vez.

Después de instalada, cada familia toca el ícono "Nos Fuimos!" como cualquier otra app — no hace falta volver a entrar por el navegador.

## Notas

- Cuando actualices el contenido de la app (nuevas fases, datos, etc.), no hace falta tocar nada de esta carpeta — el shell siempre carga la versión en vivo de Apps Script.
- Si en el futuro cambiás el ícono o el nombre, hay que volver a subir los archivos actualizados a GitHub Pages.
- Los datos (aportes, viajes, etc.) nunca se guardan en el celular — todo sigue viviendo en tu Google Sheet.

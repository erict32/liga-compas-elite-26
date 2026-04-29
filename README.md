# Liga Compas Elite 26

Mini app estatica para llevar una tabla en vivo de un torneo entre amigos de FIFA 26.

## Publicarla en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos a la raiz del repositorio:
   - `index.html`
   - `styles.css`
   - `app.js`
   - carpeta `assets/`
   - archivo `.nojekyll`
3. En GitHub entra a `Settings` -> `Pages`.
4. En `Build and deployment`, elige:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` y carpeta `/ (root)`
5. Guarda los cambios.
6. Espera unos segundos y GitHub te dara una URL publica.

## Notas

- La app guarda los marcadores en el navegador de cada persona usando `localStorage`.
- Si quieres que todos vean exactamente los mismos resultados en tiempo real, luego habria que conectarla a una base de datos o backend.
- Los equipos con escudo personalizado actual son:
  - `Deportivo Eldeva`
  - `Snupy F.C.`
  - `Aguachilito F.C`

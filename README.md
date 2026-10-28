# ⚡ AutoShop & QA Lab — Plataforma Web para Práctica de Automatización E2E y CI/CD

Aplicación web responsiva desarrollada con **HTML5, CSS3 y JavaScript Vanilla (ES Modules)** que almacena y gestiona todo su estado exclusivamente en **`localStorage`** (sin necesidad de base de datos ni backend).

Diseñada específicamente para practicar **selectores (CSS, XPath, `data-testid`, roles ARIA)**, **flujos End-to-End (E2E)**, **manipulación avanzada del DOM** e **integración y despliegue continuo (CI/CD)**.

---

## 🚀 Cómo ejecutar el proyecto localmente

Dado que utiliza módulos ES6 (`<script type="module">`), puedes levantarlo con cualquier servidor estático local:

```bash
# Opción 1: Usando npx serve (Node.js)
npx serve .

# Opción 2: Usando Python 3
python -m http.server 8080

# Opción 3: Extensión "Live Server" en VS Code / Antigravity
```

---

## 🔐 Credenciales de Prueba y Cupones

### Usuarios Pre-cargados en `localStorage`
| Usuario | Correo | Contraseña | Rol | Estado | Caso de Prueba Ideal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `standard_user` | `user@qalab.dev` | `SecretPassword123!` | `customer` | Activo | Login exitoso y compra E2E |
| `admin_user` | `admin@qalab.dev` | `SecretPassword123!` | `admin` | Activo | Gestión CRUD de inventario |
| `locked_out_user` | `locked@qalab.dev` | `SecretPassword123!` | `customer` | Bloqueado | Validación de mensaje de error por cuenta bloqueada |

### Cupones de Descuento (Vista Checkout)
* **`SAVE10`**: 10% de descuento sobre el subtotal.
* **`QA2026`**: 20% de descuento especial QA.
* **`FLAT25`**: $25.00 USD de descuento fijo.

---

## 🧭 Módulos y Flujos E2E para Automatizar

1. **🛍️ Storefront (Catálogo y Filtros)**
   * Búsqueda en tiempo real por nombre, SKU o descripción (`#filter-search`).
   * Filtro por categoría (`<select id="filter-category">`), slider de precio máximo (`<input type="range" id="filter-price-range">`), radio buttons de calificación mínima (`input[name="minRating"]`), y checkboxes de disponibilidad (`In Stock Only`, `On Sale Only`, `Wishlist Favorites Only`).
   * Ordenamiento por precio, calificación o alfabético (`#sort-select`).
2. **🛒 Cart & Checkout (Flujo Completo de Compra)**
   * Incrementar/decrementar cantidad de productos, eliminar ítems o vaciar carrito.
   * Aplicación y validación de cupones promocionales.
   * Formulario de envío y pago con validaciones de campos requeridos, método de envío, método de pago dinámico (oculta/muestra campos de tarjeta), aceptación de términos y condiciones, y botón de auto-llenado rápido (`#btn-autofill-checkout`).
   * Al completar la compra, se descuenta el stock real en `localStorage`, se genera un número de orden (`ORD-XXXX`) y permite descargar el recibo en formato `.json`.
3. **📦 Orders History (Historial de Órdenes)**
   * Tabla dinámica sincronizada con `localStorage`.
   * Filtro por estado (`Processing`, `Shipped`, `Delivered`, `Cancelled`), cambio de estado en línea mediante `<select>` por fila, y eliminación de órdenes.
4. **⚙️ Admin CRUD (Gestión de Inventario)**
   * Tabla con ordenamiento por columnas (`ID`, `SKU`, `Product Name`, `Category`, `Price`, `Stock`).
   * Creación y edición de productos mediante modal (`#product-modal`).
   * Selección múltiple con checkboxes y borrado masivo (`#btn-admin-bulk-delete`).
5. **🧪 QA Sandbox (11 Retos de Automatización)**
   * **1. Dynamic Waits & Async States**: Spinner de 3 segundos, aparición de token dinámico y habilitación diferida de botón.
   * **2. Dynamic IDs & Relative Locators**: Tabla donde los atributos `id` de los botones (`#btn-dyn-XXXXXX`) cambian aleatoriamente en cada renderizado para practicar XPath por texto o ejes (`//tr[@data-service-name="Database Cluster"]//button`).
   * **3. Native Dialogs & Popups**: Botones para `window.alert()`, `window.confirm()`, `window.prompt()` y un modal HTML en el DOM.
   * **4. Shadow DOM (`<qa-shadow-widget>`)**: Web Component con `#shadow-root (open)` que contiene un input, un checkbox y un botón de verificación.
   * **5. Embedded Iframe (`#qa-iframe`)**: Carga `iframe-content.html` con su propio formulario de verificación y contador de clics.
   * **6. Drag & Drop Kanban Board**: Tablero con eventos HTML5 `dragstart`/`drop` (y botón alternativo de avance) persistido en `localStorage`.
   * **7. File Upload & Dynamic Download**: Input de carga múltiple de archivos (`input[type="file"]`) y descarga dinámica de archivos `.csv` y `.txt`.
   * **8. Hover, Double-Click & Right-Click**: Menú desplegable por CSS `:hover`, contador de `dblclick`, y menú contextual personalizado con clic derecho (`contextmenu`).
   * **9. Progress Bar 75% Challenge & Pickers**: Reto para detener la barra de progreso en 75%, junto con selectores `<input type="date">` y `<input type="color">`.
   * **10. Multi-Tab, Popup Windows & Stale Element**: Enlace `target="_blank"`, apertura de ventana emergente con `window.open()` y botón que destruye y recrea un nodo del DOM para practicar `StaleElementReferenceException`.
   * **11. Lazy Infinite Scroll**: Contenedor con scroll vertical que carga lotes de registros dinámicamente hasta llegar a 50 elementos.

---

## 💾 Manejo de `localStorage` en tus Pruebas Automatizadas

Todas las llaves del proyecto utilizan el prefijo `qa_shop_`:
* `qa_shop_products`: Inventario de productos.
* `qa_shop_users`: Usuarios registrados.
* `qa_shop_current_user`: Sesión activa actual.
* `qa_shop_cart`: Productos en el carrito.
* `qa_shop_wishlist`: Lista de deseos.
* `qa_shop_orders`: Historial de órdenes creadas.
* `qa_shop_kanban`: Estado del tablero Kanban.
* `qa_shop_theme`: Tema visual (`light` / `dark`).

> **Tip para tus `beforeEach()` en Playwright / Cypress / Selenium:**
> Puedes reiniciar todo el estado haciendo clic en el botón superior **`🔄 Reset LocalStorage`** (`[data-testid="reset-storage-btn"]`) o ejecutando `window.localStorage.clear(); location.reload();`.

---

## 🔄 Publicación y Actualización Automática (CI/CD con GitHub Pages)

El proyecto ya incluye el flujo de trabajo [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Pasos para activarlo en GitHub:
1. Inicializa tu repositorio y súbelo a GitHub en la rama `main`:
   ```bash
   git init
   git add .
   git commit -m "feat: initial AutoShop & QA Lab application"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings ➔ Pages**.
3. En **Build and deployment ➔ Source**, selecciona **GitHub Actions**.
4. Cada vez que hagas un `git push` a la rama `main`, el pipeline ejecutará el job `verify-project` (donde puedes agregar tus pruebas E2E) y automáticamente actualizará la página publicada en GitHub Pages.

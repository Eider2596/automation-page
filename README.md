# AutoShop & QA Lab — Plataforma Web para Práctica de Automatización E2E y CI/CD

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
```

---

## Credenciales de Prueba y Cupones

### Usuarios Pre-cargados en `localStorage`
| Usuario | Correo | Contraseña | Rol | Estado | Caso de Prueba Ideal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `standard_user` | `user@qalab.dev` | `SecretPassword123!` | `customer` | Activo | Login exitoso y compra E2E |
| `admin_user` | `admin@qalab.dev` | `SecretPassword123!` | `admin` | Activo | Gestión CRUD de inventario |
| `locked_out_user` | `locked@qalab.dev` | `SecretPassword123!` | `customer` | Bloqueado | Validación de mensaje de error por cuenta bloqueada |

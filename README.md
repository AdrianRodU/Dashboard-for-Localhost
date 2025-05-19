# 📂 LocalHost Dashboard ⚡

**LocalHost Dashboard** es un panel de control visual hecho en PHP para desarrolladores que trabajan en local.
Permite navegar de forma organizada por las carpetas del entorno local (`htdocs`), ocultar contenido innecesario y destacar proyectos favoritos. Además contiene efectos visuales para mejorar la experiencia.

---

## 🚀 Características principales

- 📁 Explorador visual de carpetas locales (`htdocs`)
- ⭐ Gestión de favoritos para acceso rápido
- 🙈 Ocultar carpetas que no quieras ver
- 🌓 Modo oscuro automático/manual con diseño adaptable
- 🕒 Reloj en tiempo real con fecha
- 🔍 Vista previa inteligente de carpetas y archivos
- 📑 Soporte para PDF inline y enlaces externos
- 🧠 Íconos personalizados según el tipo de archivo (como VSCode)
- 📥 Instalación rápida de WordPress en cualquier carpeta
- 🔐 Validaciones seguras y control total del entorno

---

## 📸 Vista previa

> Puedes ver una parte del sistema en acción:

![Preview](assets/img/preview.gif)

---

## 🧰 Tecnologías utilizadas

- **PHP** (funciona con cualquier servidor local compatible)
- **HTML + CSS**
- **JavaScript Vanilla**
- **SweetAlert2** - modales
- **FontAwesome** - íconos generales
- **Bootstrap v5.3** -

---

## 📂 Estructura del proyecto

```markdown
📁 Root - Localhost/
├── index.php # Interfaz principal del dashboard
├── app/
│ ├── abrir-carpeta.php # Abre carpetas en el explorador de Windows
│ ├── eliminar-carpeta-progresivo.php
│ ├── instalar-wordpress.php
│ ├── limpiar-progreso.php
│ ├── progreso-carpeta.php
│ ├── obtener-versiones.php
│ ├── utils-wordpress.php
│ ├── validar-wordpress.php
│ └── verificar-contenido.php
├── assets/
│ ├── js/funciones.js # Lógica completa del sistema
│ ├── css/style.css # Estilos visuales y modo oscuro
│ └── img/preview.gif # Vista previa del sistema
```

🧼 Nota: La carpeta `/assets` se oculta automáticamente desde el código en el `index.php` para no saturar la interfaz visual porque no es relevante en la navegación diaria. Solo se accede a través del código fuente.

---

## 🔧 ¿Para qué sirve?

- Este dashboard está pensado para desarrolladores que:
  - Tienen muchos proyectos en htdocs
  - Quieren orden visual, accesos rápidos y herramientas útiles
  - Desean una alternativa más profesional que el simple listado de carpetas por defecto

---

### 📌 ¿Cómo instalarlo?

- Descarga o clona este repositorio en htdocs (por ejemplo, C:/xampp/htdocs/)
- Accede desde tu navegador a:
  - http://localhost/

¡Empieza a explorar, gestionar y mejorar tus carpetas locales!

---

## ⚙️ Requisitos

- PHP 7.4 o superior
- Un servidor local como:
  - [XAMPP](https://www.apachefriends.org/)
  - [WAMP](https://www.wampserver.com/en/)
  - [MAMP](https://www.mamp.info/en/windows/)
  - [Laragon](https://laragon.org/)
- Navegador moderno (Chrome, Firefox, Edge, etc.)

---

## 🧠 Nota del autor

Este proyecto fue creado para mejorar la experiencia de desarrollo local, tener todo a la mano y trabajar de forma limpia, visual y ordenada desde el navegador; para desarrolladores que manejan múltiples proyectos en su entorno local y desean **orden visual, velocidad y personalización**.

---

> Siéntete libre de adaptar este panel a tu flujo de trabajo personal. ¡Y no olvides hacer tu propio fork o dejar una estrellita si te inspira!

---

con ❤️ por **Adrián R.** 😊

# 📂 LocalHost Dashboard ⚡

**LocalHost Dashboard** es un panel de control visual hecho en PHP para desarrolladores que trabajan en local.
Permite navegar de forma organizada por las carpetas del entorno local (`htdocs`), ocultar contenido innecesario y destacar proyectos favoritos. Además contiene efectos visuales para mejorar la experiencia.

---

## 🚀 Características principales

- 📁 Explorador visual de carpetas en tu servidor local
- ⭐ Agrega carpetas a favoritos para acceso rápido
- 🙈 Oculta carpetas que no deseas ver en la interfaz
- 🌓 Modo oscuro elegante y adaptable
- 🕒 Reloj en tiempo real integrado
- 📑 Vista previa de archivos incluyendo PDFs (inline)
- 🧠 Íconos modernos personalizados por tipo de archivo (al estilo VS Code)

---

## 📸 Vista previa

> Puedes subir aquí una imagen o GIF para mostrar tu panel en acción:

![Preview](img/preview.gif)

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
├── index.php → Interfaz principal del panel
├── abrir-carpeta.php → Abre carpetas directamente en el explorador de Windows
├── ver-archivos.php → Muestra subarchivos de una carpeta
├── vista-previa.php → Modal para ver archivos e íconos personalizados
├── .htaccess → Configuraciones de acceso para Apache
├── assets/ → Carpeta de recursos visuales y lógicos (ver más abajo)
│   ├── css/ → Estilos personalizados del panel
│   ├── js/ → Scripts de interacción (localStorage, botones, modales, etc.)
│   └── img/ → Vista previa del Dashboard
```

🧼 Nota: La carpeta `/assets` se oculta automáticamente desde el código en el `index.php` para no saturar la interfaz visual porque no es relevante en la navegación diaria. Solo se accede a través del código fuente.

---

## ⚙️ Requisitos

- PHP 7.4 o superior
- Un servidor local como:
  - [XAMPP](https://www.apachefriends.org/)
  - [WAMP] (https://www.wampserver.com/en/)
  - [MAMP] (https://www.mamp.info/en/windows/)
  - [Laragon](https://laragon.org/)
- Navegador moderno (Chrome, Firefox, Edge, etc.)

---

## 🧠 Nota del autor

Este proyecto fue creado para mejorar la experiencia de desarrollo local, tener todo a la mano y trabajar de forma limpia, visual y ordenada desde el navegador; para desarrolladores que manejan múltiples proyectos en su entorno local y desean **orden visual, velocidad y personalización**.

---

> Siéntete libre de adaptar este panel a tu flujo de trabajo personal. ¡Y no olvides hacer tu propio fork o dejar una estrellita si te inspira!

---

con ❤️ por **Adrián R.** 😊

<?php
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: no-referrer");
header("X-XSS-Protection: 1; mode=block");
header('Content-Type: text/html; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = $_POST['action'] ?? '';
  if ($action === 'create' && !empty($_POST['folderName'])) {
    $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['folderName']);
    if (!file_exists($folder)) mkdir($folder);
  }
  if ($action === 'delete' && !empty($_POST['folderName'])) {
    $folder = $_POST['folderName'];
    if (is_dir($folder)) eliminarCarpeta($folder);
  }
  if ($action === 'rename' && !empty($_POST['oldName']) && !empty($_POST['newName'])) {
    $old = $_POST['oldName'];
    $new = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['newName']);
    if (is_dir($old) && !file_exists($new)) rename($old, $new);
  }
  header("Location: " . htmlspecialchars($_SERVER['PHP_SELF']));
  exit;
}
// Función para eliminar carpetas incluso si tienen contenido
function eliminarCarpeta($carpeta)
{
  if (!is_dir($carpeta)) return;
  foreach (scandir($carpeta) as $archivo) {
    if ($archivo === '.' || $archivo === '..') continue;
    $ruta = $carpeta . DIRECTORY_SEPARATOR . $archivo;
    if (is_dir($ruta)) {
      eliminarCarpeta($ruta); // Recursivo si es subcarpeta
    } else {
      unlink($ruta); // Elimina archivo
    }
  }
  rmdir($carpeta); // Finalmente elimina la carpeta vacía
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inicio - Localhost</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <script>
    window.carpetasDisponibles = <?php
                                  $dir = __DIR__;
                                  $archivos = scandir($dir);
                                  $carpetas = [];
                                  $carpetasOcultas = ['dashboard', 'assets', 'img', 'webalizer', 'xampp'];
                                  foreach ($archivos as $archivo) {
                                    $ruta = $dir . DIRECTORY_SEPARATOR . $archivo;
                                    if (
                                      $archivo !== '.' &&
                                      $archivo !== '..' &&
                                      is_dir($ruta) &&
                                      !in_array($archivo, $carpetasOcultas) &&
                                      $archivo[0] !== '.' // <-- esto oculta todas las carpetas que empiecen con punto
                                    ) {
                                      $carpetas[] = $archivo;
                                    }
                                  }
                                  echo json_encode($carpetas);
                                  ?>;
    const carpetasOcultasSistema = <?= json_encode($carpetasOcultas); ?>;
    // console.log("🔍 Carpetas encontradas por PHP:", window.carpetasDisponibles);
  </script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <!-- <div class="position-fixed top-0 end-0 m-3 d-flex flex-column gap-2" style="z-index:1000;">
    <button class="btn btn-outline-dark" onclick="toggleDarkMode()" title="Modo oscuro">🌙</button>
    <button class="btn btn-outline-secondary" onclick="mostrarOcultas()" title="Mostrar carpetas ocultas">👁️</button>
  </div> -->
  <div class="container py-4 contenedor-central">
    <header class="mb-4">
      <div class="container-fluid px-0">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 id="saludoInicial" class="h3 mb-0" tabindex="-1">¡Bienvenido! 👋</h1>
          <!-- Botón hamburguesa visible solo en móviles -->
          <button class="btn btn-outline-dark d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuLateral" aria-controls="menuLateral">
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- Menú normal en escritorio -->
          <nav class="d-none d-lg-flex gap-2 align-items-center flex-wrap">
            <a class="btn btn-outline-primary" href="http://localhost/dashboard/" target="_blank">
              <i class="fas fa-chart-line me-1"></i> Dashboard
            </a>
            <a class="btn btn-outline-primary" href="http://localhost/phpmyadmin/" target="_blank">
              <i class="fas fa-database me-1"></i> phpMyAdmin
            </a>
            <a class="btn btn-outline-primary" href="/phpinfo.php" target="_blank">
              <i class="fas fa-code me-1"></i> PHP Info
            </a>
            <a class="btn btn-success" href="#" onclick="abrirRaizLocalhost()" title="Abrir carpeta raíz de localhost">
              <i class="fas fa-folder-open me-1"></i> Localhost
            </a>
            <button onclick="cambiarNombreUsuario()" class="btn btn-outline-secondary btn-sm">Editar saludo</button>
            <button class="btn btn-secondary" onclick="mostrarOcultas()" title="Ver carpetas ocultas">
              👁️ Ver Ocultos
            </button>
            <div class="dropdown">
              <button class="btn btn-outline-dark dropdown-toggle d-none d-lg-inline-block" id="modoDropdownBtn" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opciones">
                🌙
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button class="dropdown-item" onclick="toggleDarkMode()">
                    <span class="modoOscuroTexto">🌙 Oscuro</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
    <hr class="divider">
    <h3 class="border-bottom pb-3 mb-3">Favoritos <span id="favoritesCount" class="badge bg-warning"></span></h3>
    <div class="mb-3">
      <button id="btnQuitarFavoritos" class="btn btn-outline-danger btn-sm" onclick="quitarTodosFavoritos()">
        <i class="fa-solid fa-folder-minus"></i> Quitar todos los favoritos
      </button>
    </div>
    <div id="favoritesList" class="row g-3"></div>
  </div>
  <div class="container contenedor-central">
    <div id="mensajeSinFavoritos" class="text-center text-muted py-5 w-100 d-none mb-4">
      <i class="fas fa-star fa-2x mb-3"></i>
      <p class="mb-0 fs-5">No hay ninguna carpeta agregada en favoritos</p>
    </div>
  </div>
  <!--
  <div class="container contenedor-central">
    <hr class="divider">
  </div> -->
  <div class="container mb-4 contenedor-central">
    <h3 class="border-bottom pb-3 mb-3"> Carpetas locales <span id="localCount" class="badge bg-primary"></span></h3>
    <div class="mb-3">
      <button class="btn btn-outline-success btn-sm" onclick="crearCarpeta()">
        <i class="fas fa-folder-plus me-1 "></i> Crear carpeta
      </button>
    </div>
    <div id="mensajeSinLocales" class="text-center text-muted py-5 w-100 d-none mb-4">
      <i class="fas fa-folder-open fa-2x mb-3"></i>
      <p class="mb-0 fs-5">No hay carpetas locales visibles</p>
    </div>
    <div class="row g-3" id="folderGrid">
      <?php
      // Render de carpetas desactivado. Se usará JavaScript para mostrar carpetas dinámicamente.
      ?>
    </div>
  </div>
  <div class="position-fixed bottom-0 start-0 m-3 bg-dark text-white px-3 py-2 rounded shadow" id="time"></div>
  <div class="container contenedor-central">
    <hr class="divider">
    <footer class="text-center mt-3 py-3 small">
      Creado con ❤️ por <a href="https://instagram.com/adrianrodu" class="text-decoration-none fw-bold" target="_blank">Adrián</a>
    </footer>
  </div>
  <div class="offcanvas offcanvas-start custom-offcanvas" tabindex="-1" id="menuLateral" aria-labelledby="menuLateralLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="menuLateralLabel">Menú</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column gap-3">
      <a class="btn btn-primary w-100" href="http://localhost/dashboard/" target="_blank">
        <i class="fas fa-chart-line me-1"></i> Dashboard
      </a>
      <a class="btn btn-primary w-100" href="http://localhost/phpmyadmin/" target="_blank">
        <i class="fas fa-database me-1"></i> phpMyAdmin
      </a>
      <a class="btn btn-primary w-100" href="/phpinfo.php" target="_blank">
        <i class="fas fa-code me-1"></i> PHP Info
      </a>
      <hr>
      <button class="btn btn-warning w-100" onclick="abrirRaizLocalhost()">
        <i class="fas fa-folder-open me-1"></i> Carpeta Localhost
      </button>
      <button class="btn btn-dark w-100" onclick="toggleDarkMode()">
        <span class="modoOscuroTexto">🌙 Modo Oscuro</span>
      </button>
      <button class="btn btn-secondary w-100" onclick="mostrarOcultas()">
        👁️ Ver carpetas ocultas
      </button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/funciones.js"></script>
</body>
</html>

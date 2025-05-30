<?php
header('Content-Type: application/json');

$carpeta = $_GET['carpeta'] ?? '';
$base = realpath(__DIR__ . '/../');
$ruta = $base . '/' . $carpeta;

// Seguridad: Evita rutas externas
if (strpos(realpath(dirname($ruta)), $base) !== 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Ruta fuera del directorio permitido'
    ]);
    exit;
}

// Crea carpeta si no existe (solo para validar estructura)
if (!file_exists($ruta)) {
    mkdir($ruta, 0755, true);
}

if (!is_dir($ruta)) {
    echo json_encode([
        'success' => false,
        'message' => 'La ruta no es una carpeta válida'
    ]);
    exit;
}

// ✅ Incluir validador principal
require_once __DIR__ . '/utils-wordpress.php';

// Paso 1: Verificar si ya hay WordPress
$resultado = validarInstalacionWordPress($ruta);
if ($resultado['instalado']) {
    echo json_encode([
        'success' => false,
        'wordpress' => true,
        'message' => $resultado['mensaje']
    ]);
    exit;
}

// Paso 2: Buscar si hay otros archivos comunes
$contenido = array_diff(scandir($ruta), ['.', '..']);
$archivosComunes = [];

foreach ($contenido as $item) {
    $path = $ruta . '/' . $item;
    $nombre = strtolower($item);

    if (is_file($path) && !in_array($nombre, ['index.php', 'wp-config.php']) && !str_starts_with($nombre, 'wp-')) {
        $archivosComunes[] = $item;
    }
}

// Paso 3: Si hay archivos comunes, devolver advertencia
if (!empty($archivosComunes)) {
    echo json_encode([
        'success' => false,
        'carpetaLlena' => true,
        'archivos' => $archivosComunes
    ]);
    exit;
}

// ✅ Carpeta vacía y apta para instalar
echo json_encode(['success' => true]);

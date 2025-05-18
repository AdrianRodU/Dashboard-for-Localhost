<?php
header('Content-Type: application/json');

$carpeta = $_GET['carpeta'] ?? '';
$base = realpath(__DIR__ . '/../');
$ruta = $base . '/' . $carpeta;

// Seguridad: evitar rutas fuera del proyecto
if (strpos(realpath(dirname($ruta)), $base) !== 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Ruta fuera del directorio permitido'
    ]);
    exit;
}

// ✅ Si la carpeta no existe aún, permitimos instalar
if (!file_exists($ruta)) {
    echo json_encode(['success' => true]);
    exit;
}

// Si existe pero no es una carpeta válida
if (!is_dir($ruta)) {
    echo json_encode([
        'success' => false,
        'message' => 'La ruta especificada no es una carpeta válida'
    ]);
    exit;
}

// Incluir lógica de detección de WordPress
require_once __DIR__ . '/utils-wordpress.php';
$resultado = validarInstalacionWordPress($ruta);

if ($resultado['instalado']) {
    echo json_encode([
        'success' => false,
        'wordpress' => true,
        'message' => $resultado['mensaje']
    ]);
    exit;
}

// Revisar si hay archivos comunes
$contenido = array_diff(scandir($ruta), ['.', '..']);
$archivosComunes = [];

foreach ($contenido as $item) {
    $path = $ruta . '/' . $item;
    $nombre = strtolower($item);

    if (is_file($path) && !in_array($nombre, ['index.php', 'wp-config.php']) && !str_starts_with($nombre, 'wp-')) {
        $archivosComunes[] = $item;
    }
}

// ✅ Si hay contenido no relacionado a WordPress
if (!empty($archivosComunes)) {
    echo json_encode([
        'success' => false,
        'yaExiste' => true,
        'archivos' => $archivosComunes
    ]);
    exit;
}

// ✅ Si la carpeta está vacía
echo json_encode(['success' => true]);

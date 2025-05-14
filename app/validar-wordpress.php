<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
try {
    require_once realpath(__DIR__ . "/utils-wordpress.php");
    $carpeta = basename($_GET['carpeta'] ?? '');
    if (!$carpeta) {
        echo json_encode(['success' => false, 'message' => 'Carpeta no especificada']);
        exit;
    }
    $base = realpath(__DIR__ . '/../');
    $ruta = realpath($base . '/' . $carpeta);
    if (!$ruta || strpos($ruta, $base) !== 0 || !is_dir($ruta)) {
        echo json_encode(['success' => false, 'message' => 'La carpeta no existe o es inválida']);
        exit;
    }
    $resultado = validarInstalacionWordPress($ruta);
    if ($resultado['instalado']) {
        echo json_encode([
            'success' => false,
            'message' => $resultado['mensaje']
        ]);
    } else {
        echo json_encode(['success' => true]);
    }
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error interno: ' . $e->getMessage()
    ]);
}

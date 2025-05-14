<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
$carpeta = basename($_GET['carpeta'] ?? '');
$idioma = $_GET['idioma'] ?? 'latest';
$version = $_GET['version'] ?? 'latest';
if (!$carpeta) {
    echo json_encode(['success' => false, 'message' => 'Carpeta no especificada']);
    exit;
}
$ruta = __DIR__ . DIRECTORY_SEPARATOR . $carpeta;
if (!is_dir($ruta)) {
    echo json_encode(['success' => false, 'message' => 'La carpeta no existe']);
    exit;
}
// VALIDACIÓN COMPLETA: Detectar si ya hay WordPress
$posibles = [
    'index.php',
    'wp-config.php',
    'wp-admin',
    'wp-includes',
    'wp-content'
];
foreach ($posibles as $elemento) {
    if (file_exists($ruta . DIRECTORY_SEPARATOR . $elemento)) {
        echo json_encode([
            'success' => false,
            'message' => 'Ya se detectó una instalación de WordPress en esta carpeta. Por seguridad, elimina el contenido antes de instalar nuevamente.'
        ]);
        exit;
    }
}
// Construir URL de descarga
if ($version === 'latest' && $idioma === 'latest') {
    $url = 'https://wordpress.org/latest.zip';
} elseif ($version === 'latest') {
    $url = "https://$idioma.wordpress.org/latest-$idioma.zip";
} else {
    $url = "https://wordpress.org/wordpress-$version.zip";
}
$archivoZip = $ruta . DIRECTORY_SEPARATOR . 'wordpress.zip';
$contenidoZip = @file_get_contents($url);
if (!$contenidoZip) {
    echo json_encode(['success' => false, 'message' => 'No se pudo descargar WordPress. Verifica la versión o idioma.']);
    exit;
}
file_put_contents($archivoZip, $contenidoZip);
// Extraer
$zip = new ZipArchive;
if ($zip->open($archivoZip) === TRUE) {
    $zip->extractTo($ruta);
    $zip->close();
    unlink($archivoZip);
    // Mover archivos fuera de /wordpress
    $wordpressPath = $ruta . DIRECTORY_SEPARATOR . 'wordpress';
    if (is_dir($wordpressPath)) {
        $archivos = scandir($wordpressPath);
        foreach ($archivos as $archivo) {
            if ($archivo !== '.' && $archivo !== '..') {
                rename($wordpressPath . DIRECTORY_SEPARATOR . $archivo, $ruta . DIRECTORY_SEPARATOR . $archivo);
            }
        }
        rmdir($wordpressPath);
    }
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo descomprimir WordPress']);
}

<?php
if (isset($_GET['carpeta'])) {
    $relativa = $_GET['carpeta'];
    // Directorio base del proyecto (sube desde /app)
    $base = realpath(__DIR__ . '/../');
    // Si pide "root", abrimos la carpeta raíz
    if ($relativa === 'root') {
        $ruta = $base;
    } else {
        $ruta = realpath($base . DIRECTORY_SEPARATOR . $relativa);
    }
    if ($ruta && is_dir($ruta)) {
        $rutaWindows = str_replace('/', '\\', $ruta);
        pclose(popen("start explorer \"$rutaWindows\"", "r"));
    } else {
        error_log("❌ No se encontró la ruta: $ruta");
    }
}

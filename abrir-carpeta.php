<?php
if (isset($_GET['carpeta'])) {
    $relativa = $_GET['carpeta'];
    // Si pide "root", abrimos htdocs directamente
    if ($relativa === 'root') {
        $ruta = realpath("C:/xampp/htdocs");
    } else {
        $base = __DIR__;
        $ruta = realpath($base . DIRECTORY_SEPARATOR . $relativa);
    }
    if ($ruta && is_dir($ruta)) {
        shell_exec("start explorer \"$ruta\"");
    } else {
        error_log("No se encontró la ruta: $ruta");
    }
}

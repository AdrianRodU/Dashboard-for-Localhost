<?php
$dir = __DIR__;
$archivos = scandir($dir);

foreach ($archivos as $archivo) {
    if (preg_match('/^(progress|done)-.+\\.(json|flag)$/', $archivo)) {
        unlink($dir . DIRECTORY_SEPARATOR . $archivo);
    }
}

echo "Archivos de progreso eliminados correctamente.";

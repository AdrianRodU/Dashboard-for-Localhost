<?php
header("Content-Type: application/json");
error_reporting(0);
ini_set("display_errors", 0);

$modoDebug = false;

function logDebug($mensaje)
{
    global $modoDebug;
    if ($modoDebug) {
        file_put_contents(__DIR__ . "/debug.txt", $mensaje . "\n", FILE_APPEND);
    }
}

try {
    $folder = basename($_GET['carpeta'] ?? '');
    logDebug("folder recibido: $folder");

    if (!$folder) {
        logDebug("carpeta no especificada");
        echo json_encode(['success' => false, 'message' => 'Carpeta no especificada']);
        exit;
    }

    $base = realpath(__DIR__ . "/../");
    $ruta = realpath($base . "/" . $folder);
    $progressFile = __DIR__ . "/progress-$folder.json";
    $doneFlag = __DIR__ . "/done-$folder.flag";

    logDebug("ruta resuelta: $ruta");

    if (!is_dir($ruta)) {
        logDebug("la carpeta no existe");
        echo json_encode(['success' => false, 'message' => 'La carpeta no existe']);
        exit;
    }

    $archivos = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($ruta, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    $paths = [];
    foreach ($archivos as $f) {
        $paths[] = $f;
    }

    $total = max(1, count($paths));
    logDebug("total archivos: $total");
    file_put_contents($progressFile, json_encode(['total' => $total, 'actual' => 0]));

    $actual = 0;
    foreach ($paths as $f) {
        $path = $f->getRealPath();
        if ($f->isDir()) {
            if (@rmdir($path)) {
                logDebug("📁 borrado: $path");
            } else {
                logDebug("❌ no se pudo borrar dir: $path");
            }
        } else {
            if (@unlink($path)) {
                logDebug("🗑️ archivo eliminado: $path");
            } else {
                logDebug("❌ no se pudo borrar archivo: $path");
            }
        }
        $actual++;
        file_put_contents($progressFile, json_encode(['total' => $total, 'actual' => $actual]));
    }

    if (@rmdir($ruta)) {
        logDebug("📂 carpeta principal eliminada");
    } else {
        logDebug("❌ no se pudo eliminar carpeta principal");
    }

    file_put_contents($doneFlag, "done");
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    logDebug("🛑 Error interno: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error interno: ' . $e->getMessage()
    ]);
}

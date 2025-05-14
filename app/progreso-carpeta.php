<?php
header("Content-Type: application/json");

$folder = basename($_GET['carpeta'] ?? '');
if (!$folder) {
    echo json_encode(['total' => 1, 'actual' => 0]);
    exit;
}

$progressFile = __DIR__ . "/progress-$folder.json";
$doneFlag = __DIR__ . "/done-$folder.flag";

// ✅ Si ya terminó
if (file_exists($doneFlag)) {
    @unlink($progressFile);
    @unlink($doneFlag);
    echo json_encode(['total' => 1, 'actual' => 1]);
    exit;
}

// ✅ Si aún existe el archivo de progreso
if (file_exists($progressFile)) {
    $contenido = file_get_contents($progressFile);
    if ($contenido) {
        echo $contenido;
        exit;
    }
}

// ❌ Si no hay nada aún, devolvemos progreso en 0
echo json_encode(['total' => 1, 'actual' => 0]);

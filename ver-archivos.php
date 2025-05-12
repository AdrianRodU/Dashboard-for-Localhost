<?php
$ruta = $_GET['ruta'] ?? '';
$ruta = rtrim($ruta, '/');

$base = realpath('.');
$directorio = realpath($base . '/' . $ruta);

if (!$directorio || strpos($directorio, $base) !== 0) {
  http_response_code(403);
  exit;
}

$archivos = scandir($directorio);
$resultado = [];

foreach ($archivos as $archivo) {
  if ($archivo === '.' || $archivo === '..') continue;
  $rutaCompleta = $directorio . '/' . $archivo;
  $resultado[] = is_dir($rutaCompleta) ? $archivo . '/' : $archivo;
}

header('Content-Type: application/json');
echo json_encode($resultado);
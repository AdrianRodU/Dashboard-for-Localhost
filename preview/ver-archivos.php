<?php
header('Content-Type: application/json');
$base = realpath(__DIR__ . '/../');
$relativa = $_GET['ruta'] ?? '';
$relativa = trim($relativa, '/');
// Calculamos ruta absoluta solo si se pasa algo
$directorio = $relativa ? realpath($base . '/' . $relativa) : $base;
// Validación de seguridad
if (!$directorio || strpos($directorio, $base) !== 0 || !is_dir($directorio)) {
  http_response_code(403);
  exit;
}
// Leer archivos
$archivos = scandir($directorio);
$resultado = [];
foreach ($archivos as $archivo) {
  if ($archivo === '.' || $archivo === '..') continue;
  $rutaCompleta = $directorio . '/' . $archivo;
  $resultado[] = is_dir($rutaCompleta) ? $archivo . '/' : $archivo;
}
echo json_encode($resultado);

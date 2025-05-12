<?php
$carpeta = $_GET['carpeta'] ?? '';
$carpeta = preg_replace('/[^a-zA-Z0-9_-]/', '', $carpeta); // Seguridad básica

if (!is_dir($carpeta)) {
  echo json_encode(['error' => 'No se encontró la carpeta.']);
  exit;
}

$contenido = scandir($carpeta);
$contenido = array_filter($contenido, function ($item) {
  return $item !== '.' && $item !== '..';
});

echo json_encode(array_values($contenido));

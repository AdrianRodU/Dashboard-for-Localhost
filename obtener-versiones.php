<?php
header("Content-Type: application/json");
$data = @file_get_contents("https://api.wordpress.org/core/version-check/1.7/");
if ($data === false) {
    echo json_encode(["error" => "No se pudo conectar con WordPress"]);
    exit;
}
$json = json_decode($data, true);
$offers = $json["offers"] ?? [];
$versiones = array_unique(array_column($offers, "version"));
echo json_encode(array_slice($versiones, 0, 5)); // solo 5 últimas

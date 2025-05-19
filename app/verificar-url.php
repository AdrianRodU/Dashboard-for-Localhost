<?php
header('Content-Type: application/json');

$url = $_GET['url'] ?? '';
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['success' => false, 'message' => 'URL inválida']);
    exit;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);      // Recibir respuesta
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);      // Seguir redirecciones
curl_setopt($ch, CURLOPT_TIMEOUT, 5);                // Máximo 5 segundos
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);     // Ignorar verificación de SSL local
curl_setopt($ch, CURLOPT_USERAGENT, 'LocalDashboardBot/1.0'); // Algunos servidores lo requieren

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_errno($ch);
curl_close($ch);

if ($err) {
    echo json_encode(['success' => false, 'message' => 'No responde']);
} elseif ($http_code >= 200 && $http_code < 400) {
    echo json_encode(['success' => true, 'message' => 'URL activa']);
} else {
    echo json_encode(['success' => false, 'message' => "HTTP $http_code"]);
}

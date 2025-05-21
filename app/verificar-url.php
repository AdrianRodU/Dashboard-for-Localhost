<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$url = $_GET['url'] ?? '';

// 1. Validar que tenga formato válido general
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['success' => false, 'message' => '❌ La URL es inválida o está mal formada.']);
    exit;
}

// 2. Validar que NO termine en punto (como https://quirovida.com.)
if (preg_match('/\.$/', $url)) {
    echo json_encode(['success' => false, 'message' => '❌ La URL no debe terminar con un punto.']);
    exit;
}

// 3. Extraer host y validar que sea resoluble
$host = parse_url($url, PHP_URL_HOST);

if (!$host) {
    echo json_encode(['success' => false, 'message' => '❌ No se pudo extraer el dominio de la URL.']);
    exit;
}

$ip = gethostbyname($host);
if ($ip === $host) {
    if (preg_match('/\.test$/', $host) || $host === 'localhost') {
        echo json_encode(['success' => false, 'message' => '⚠️ Dominio local no resuelto. Revisa tu archivo "hosts" o configuración de Apache.']);
    } else {
        echo json_encode(['success' => false, 'message' => '⚠️ El dominio no existe o no se encuentra en DNS públicos.']);
    }
    exit;
}

// 4. Verificar que cURL esté disponible
if (!function_exists('curl_init')) {
    echo json_encode(['success' => false, 'message' => '⚠️ PHP no tiene habilitado cURL.']);
    exit;
}

// 5. Verificar si la URL responde correctamente con cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);      // Recibir respuesta
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);      // Seguir redirecciones
curl_setopt($ch, CURLOPT_TIMEOUT, 5);                // Máximo 5 segundos
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);     // Ignorar verificación de SSL local
curl_setopt($ch, CURLOPT_USERAGENT, 'LocalDashboardBot/1.0'); // Algunos servidores lo requieren

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error_msg = curl_error($ch);
curl_close($ch);

// 6. Interpretar la respuesta final
if (!$response) {
    echo json_encode(['success' => false, 'message' => "❌ No se pudo conectar: $error_msg"]);
} elseif ($http_code >= 200 && $http_code < 400) {
    echo json_encode(['success' => true, 'message' => 'URL activa y responde correctamente ✅ ']);
} else {
    $mensaje = "⚠️ La URL respondió con HTTP $http_code";
    if ($http_code === 500) {
        $mensaje = "❌ La URL existe, pero tiene errores internos de PHP (HTTP 500). Revisa plugins, archivos corruptos o errores en el sitio.";
    }
    echo json_encode(['success' => false, 'message' => $mensaje]);
}

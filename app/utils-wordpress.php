<?php
function validarInstalacionWordPress($ruta)
{
    $esWP = false;
    foreach (['index.php', 'wp-includes', 'wp-admin'] as $elemento) {
        if (file_exists($ruta . DIRECTORY_SEPARATOR . $elemento)) {
            $esWP = true;
            break;
        }
    }

    if (!$esWP) {
        return ['instalado' => false];
    }

    // Obtener versión
    $versionFile = $ruta . '/wp-includes/version.php';
    $wpVersion = '';
    if (file_exists($versionFile)) {
        $contenido = file_get_contents($versionFile);
        if (preg_match("/\\\$wp_version\s*=\s*'([^']+)'/", $contenido, $matches)) {
            $wpVersion = $matches[1];
        }
    }

    $configExiste = file_exists($ruta . '/wp-config.php');

    $archivosEsperados = [
        'index.php',
        'license.txt',
        'readme.html',
        'wp-activate.php',
        'wp-admin',
        'wp-blog-header.php',
        'wp-comments-post.php',
        'wp-config-sample.php',
        'wp-content',
        'wp-cron.php',
        'wp-includes',
        'wp-links-opml.php',
        'wp-load.php',
        'wp-login.php',
        'wp-mail.php',
        'wp-settings.php',
        'wp-signup.php',
        'wp-trackback.php',
        'xmlrpc.php',
    ];

    $contenidoCarpeta = array_diff(scandir($ruta), ['.', '..']);
    $extras = array_diff($contenidoCarpeta, $archivosEsperados);
    $hayExtras = count($extras) > 0;

    $mensaje = "<p>Ya se detectó una instalación previa de ";
    $mensaje .= $wpVersion
        ? "<b>WordPress</b> <span class='badge bg-primary'>v{$wpVersion}</span>.</p>"
        : "<span class='badge bg-secondary'>versión no detectada</span></p>";

    if (!$configExiste) {
        $mensaje .= "<p>El archivo <span class='badge bg-warning text-dark'>wp-config.php</span> no ha sido configurado todavía.</p>";
    }

    // ✅ Detectar carpeta "wordpress/" residual
    if (is_dir($ruta . '/wordpress')) {
        $mensaje .= "<p>⚠️ Se detectó una subcarpeta <span class='badge bg-danger'>wordpress/</span> que sugiere una instalación incompleta.</p>";
    }

    if ($hayExtras) {
        $mensaje .= "<p><span class='badge bg-danger mb-1 d-inline-block'>⚠️ Archivos adicionales detectados:</span></p><ul class='mt-2 mb-1 list-unstyled' style='padding-left: 1.2rem; font-size: 0.9rem;'>";
        $primeros = array_slice($extras, 0, 4);
        foreach ($primeros as $archivo) {
            $ext = pathinfo($archivo, PATHINFO_EXTENSION);
            $icono = match (true) {
                in_array($ext, ['php']) => "🟪",
                in_array($ext, ['js', 'ts']) => "🟨",
                in_array($ext, ['zip', 'rar']) => "🧳",
                default => "📄"
            };
            $mensaje .= "<li>$icono $archivo</li>";
        }
        if (count($extras) > 4) {
            $mensaje .= "<li>…</li>";
        }
        $mensaje .= "</ul>";
    }

    return ['instalado' => true, 'mensaje' => $mensaje];
}

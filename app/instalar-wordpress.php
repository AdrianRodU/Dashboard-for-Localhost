<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

// ✅ VALIDACIÓN ANTICIPADA: solo verifica compatibilidad del servidor
if (isset($_GET['validar']) && $_GET['validar'] === 'solo') {
    if (!class_exists('ZipArchive')) {
        echo json_encode([
            "success" => false,
            "message" => "<p><strong>Error Interno</strong>: El servidor no tiene habilitada la extensión <code>zip</code> de PHP.</p>
            <p>Esta extensión es necesaria para poder instalar <span class='badge bg-primary'>WordPress</span> automáticamente desde el panel.</p>
            <hr class='divider'>
            <p class='text-start'><strong>¿Cómo solucionarlo?</strong></p>
            <ul class='text-start list-unstyled'>
              <li>🔧 Abre el archivo <code>php.ini</code></li>
              <li>🔍 Busca: <code>;extension=zip</code></li>
              <li>✅ Quita el punto y coma: <code>extension=zip</code></li>
              <li>💾 Guarda los cambios</li>
              <li>🔄 Reinicia Apache</li>
            </ul>
            <p class='mt-3'>Luego de eso, vuelve a intentar instalar WordPress. 😄</p>"
        ]);
    } else {
        echo json_encode(["success" => true]);
    }
    exit;
}

try {
    require_once realpath(__DIR__ . "/utils-wordpress.php");

    $carpeta = $_GET['carpeta'] ?? '';
    $idioma = $_GET['idioma'] ?? 'latest';
    $version = $_GET['version'] ?? 'latest';

    if (!$carpeta) {
        echo json_encode(['success' => false, 'message' => 'Carpeta no especificada']);
        exit;
    }

    $nombreFinal = basename($carpeta);
    $forzar = isset($_GET['forzar']) && $_GET['forzar'] == 1;

    if (strtolower($nombreFinal) === 'wordpress' && !$forzar) {
        echo json_encode([
            'success' => false,
            'message' => '
                <p><b>Error:</b> No puedes instalar WordPress en una carpeta llamada
                <span class="badge bg-danger">wordpress</span></p>
                <p>Esto causaría una estructura duplicada como
                <code>wordpress/wordpress/</code> y una instalación corrupta.</p>
                <p>Por favor, usa un nombre distinto como
                <span class="badge bg-primary">mi-wordpress</span> o
                <span class="badge bg-secondary">sitio-wp</span>.</p>'
        ]);
        exit;
    }

    $base = realpath(__DIR__ . '/../');
    $ruta = $base . '/' . $carpeta;

    if (!file_exists($ruta)) {
        mkdir($ruta, 0755, true);
    }

    if (strpos(realpath(dirname($ruta)), $base) !== 0) {
        echo json_encode(['success' => false, 'message' => 'Ruta fuera del directorio permitido']);
        exit;
    }

    if (!file_exists($ruta)) {
        if (!mkdir($ruta, 0755, true)) {
            echo json_encode(['success' => false, 'message' => '❌ No se pudo crear la carpeta']);
            exit;
        }
    }

    if (!is_dir($ruta)) {
        echo json_encode(['success' => false, 'message' => 'La ruta especificada no es una carpeta válida']);
        exit;
    }

    $resultado = validarInstalacionWordPress($ruta);
    if ($resultado['instalado']) {
        echo json_encode([
            'success' => false,
            'wordpress' => true,
            'message' => $resultado['mensaje']
        ]);
        exit;
    }

    $archivos = array_diff(scandir($ruta), ['.', '..']);
    $archivosComunes = [];

    foreach ($archivos as $archivo) {
        $archivoReal = $ruta . '/' . $archivo;
        $nombre = strtolower($archivo);
        if (is_file($archivoReal) && !in_array($nombre, ['index.php', 'wp-config.php']) && !str_starts_with($nombre, 'wp-')) {
            $archivosComunes[] = $archivo;
        }
    }

    if (!empty($archivosComunes) && !$forzar) {
        echo json_encode([
            'success' => false,
            'carpetaLlena' => true,
            'archivos' => $archivosComunes
        ]);
        exit;
    }

    $url = ($version === 'latest' && $idioma === 'latest')
        ? 'https://wordpress.org/latest.zip'
        : ($version === 'latest'
            ? "https://$idioma.wordpress.org/latest-$idioma.zip"
            : "https://wordpress.org/wordpress-$version.zip");

    $archivoZip = $ruta . DIRECTORY_SEPARATOR . 'wordpress.zip';
    $contenidoZip = @file_get_contents($url);
    if (!$contenidoZip) {
        echo json_encode([
            'success' => false,
            'message' => '
                <p><strong>No se pudo descargar WordPress.</strong></p>
                <hr class="divider">
                <ul class="text-start list-unstyled">
                    <li>🌐 Verifica tu conexión a Internet</li>
                    <li>📦 Revisa que la versión o idioma de WordPress sea válida</li>
                    <li>🔄 Intenta nuevamente en unos segundos</li>
                </ul>
                <p class="mt-2">Si el problema persiste, puedes instalar WordPress manualmente desde <a href="https://wordpress.org" target="_blank">wordpress.org</a>.</p>
            '
        ]);
        exit;
    }

    file_put_contents($archivoZip, $contenidoZip);

    $zip = new ZipArchive;
    if ($zip->open($archivoZip) === TRUE) {
        $zip->extractTo($ruta);
        $zip->close();
        unlink($archivoZip);

        $wordpressPath = $ruta . DIRECTORY_SEPARATOR . 'wordpress';
        $fallos = [];

        function copiarContenido($src, $dest, &$fallos)
        {
            if (is_dir($src)) {
                if (!is_dir($dest)) {
                    mkdir($dest, 0755, true);
                }
                foreach (scandir($src) as $archivo) {
                    if ($archivo === '.' || $archivo === '..') continue;
                    copiarContenido($src . DIRECTORY_SEPARATOR . $archivo, $dest . DIRECTORY_SEPARATOR . $archivo, $fallos);
                }
                @rmdir($src);
            } else {
                if (!@copy($src, $dest)) {
                    $fallos[] = basename($src);
                } else {
                    @unlink($src);
                }
            }
        }

        if (is_dir($wordpressPath)) {
            copiarContenido($wordpressPath, $ruta, $fallos);
        }

        if (!empty($fallos)) {
            echo json_encode([
                'success' => false,
                'message' => 'La instalación se realizó parcialmente. Archivos no movidos: ' . implode(', ', $fallos)
            ]);
            exit;
        }

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo descomprimir WordPress']);
    }
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error interno: ' . $e->getMessage()
    ]);
}

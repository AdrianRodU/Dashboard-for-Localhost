<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

try {
    require_once realpath(__DIR__ . "/utils-wordpress.php");

    $carpeta = basename($_GET['carpeta'] ?? '');
    $idioma = $_GET['idioma'] ?? 'latest';
    $version = $_GET['version'] ?? 'latest';

    if (!$carpeta) {
        echo json_encode(['success' => false, 'message' => 'Carpeta no especificada']);
        exit;
    }

    $base = realpath(__DIR__ . '/../');
    $ruta = realpath($base . '/' . $carpeta);

    // Validación desde php
    $forzar = isset($_GET['forzar']) && $_GET['forzar'] == 1;

    if (strtolower($carpeta) === 'wordpress' && !$forzar) {
        echo json_encode([
            'success' => false,
            'message' => '
                <p><b>Error:</b> No puedes instalar WordPress en una carpeta llamada
                <span class="badge bg-danger">wordpress</span>.</p>
                <p>Esto causaría una estructura duplicada como
                <code>wordpress/wordpress/</code> y una instalación corrupta.</p>
                <p>Por favor, usa un nombre distinto como
                <span class="badge bg-primary">mi-wordpress</span> o
                <span class="badge bg-secondary">sitio-wp</span>.</p>'
        ]);
        exit;
    }


    if (!$ruta || strpos($ruta, $base) !== 0 || !is_dir($ruta)) {
        echo json_encode(['success' => false, 'message' => 'La carpeta no existe o es inválida']);
        exit;
    }

    // Validación previa
    $resultado = validarInstalacionWordPress($ruta);
    if ($resultado['instalado']) {
        echo json_encode(['success' => false, 'message' => $resultado['mensaje']]);
        exit;
    }

    // Construcción de URL
    if ($version === 'latest' && $idioma === 'latest') {
        $url = 'https://wordpress.org/latest.zip';
    } elseif ($version === 'latest') {
        $url = "https://$idioma.wordpress.org/latest-$idioma.zip";
    } else {
        $url = "https://wordpress.org/wordpress-$version.zip";
    }

    $archivoZip = $ruta . DIRECTORY_SEPARATOR . 'wordpress.zip';
    $contenidoZip = @file_get_contents($url);
    if (!$contenidoZip) {
        echo json_encode(['success' => false, 'message' => 'No se pudo descargar WordPress. Verifica la versión o idioma.']);
        exit;
    }

    file_put_contents($archivoZip, $contenidoZip);

    $zip = new ZipArchive;
    if ($zip->open($archivoZip) === TRUE) {
        $zip->extractTo($ruta);
        $zip->close();
        unlink($archivoZip);

        // Mover archivos desde /wordpress con copia segura
        $wordpressPath = $ruta . DIRECTORY_SEPARATOR . 'wordpress';
        $fallos = [];

        function copiarContenido($src, $dest, &$fallos)
        {
            if (is_dir($src)) {
                if (!is_dir($dest)) {
                    mkdir($dest, 0755, true);
                }

                $archivos = scandir($src);
                foreach ($archivos as $archivo) {
                    if ($archivo === '.' || $archivo === '..') continue;

                    $rutaSrc = $src . DIRECTORY_SEPARATOR . $archivo;
                    $rutaDest = $dest . DIRECTORY_SEPARATOR . $archivo;

                    copiarContenido($rutaSrc, $rutaDest, $fallos);
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

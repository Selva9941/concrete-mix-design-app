<?php
// High-performance router for php -S.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

// Serve static files directly when they exist.
if ($path !== '/' && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    // Long cache for versioned/static assets.
    if (in_array($ext, ['css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'ico', 'woff', 'woff2'], true)) {
        header('Cache-Control: public, max-age=31536000, immutable');
    } elseif ($ext === 'html') {
        header('Cache-Control: no-cache, must-revalidate');
    }

    return false;
}

// Route API shorthand (/api/...) to api.php.
if (strpos($path, '/api/') === 0) {
    $_SERVER['REQUEST_URI'] = '/api.php' . substr($path, 4);
    require __DIR__ . '/api.php';
    exit;
}

// Support /api.php/* and /api.php
if ($path === '/api.php' || strpos($path, '/api.php/') === 0) {
    require __DIR__ . '/api.php';
    exit;
}

// Default entry page.
if ($path === '/' || $path === '') {
    require __DIR__ . '/index.html';
    exit;
}

// Fallback to 404 page behavior.
http_response_code(404);
echo '404 Not Found';

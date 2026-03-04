<?php
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($uri, '/');

function readJsonBody() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function storagePath() {
    return __DIR__ . '/data/designs.json';
}

function loadDesigns() {
    $file = storagePath();
    if (!file_exists(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }
    if (!file_exists($file)) {
        file_put_contents($file, json_encode([]));
    }
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function saveDesigns($designs) {
    file_put_contents(storagePath(), json_encode($designs, JSON_PRETTY_PRINT));
}

function calculateMix($payload) {
    $grade = strtoupper(trim($payload['grade'] ?? 'M20'));
    $wcr = floatval($payload['wcr'] ?? 0.5);
    $slump = floatval($payload['slump'] ?? 75);
    $aggSize = floatval($payload['aggSize'] ?? 20);
    $stdDev = floatval($payload['stdDev'] ?? 4);
    $admixturePct = floatval($payload['admixturePct'] ?? 0);

    preg_match('/\d+/', $grade, $m);
    $fck = isset($m[0]) ? floatval($m[0]) : 20;
    $targetMeanStrength = $fck + 1.65 * $stdDev;

    if ($aggSize <= 10) $baseWater = 208;
    elseif ($aggSize <= 20) $baseWater = 186;
    elseif ($aggSize <= 40) $baseWater = 165;
    else $baseWater = 160;

    $slumpAdjustment = (($slump - 50) / 25) * 0.03;
    $waterAfterSlump = $baseWater * (1 + $slumpAdjustment);
    $waterAfterAdmix = $waterAfterSlump * (1 - $admixturePct * 0.01 * 0.08);

    $minByGrade = [15 => 240, 20 => 300, 25 => 300, 30 => 320, 35 => 340, 40 => 360];
    $minCement = $minByGrade[$fck] ?? 300;
    $cement = max($waterAfterAdmix / max($wcr, 0.01), $minCement);
    $water = $cement * $wcr;

    $sgCement = 3.15; $sgFA = 2.65; $sgCA = 2.7; $sgAd = 1.1;
    $airContent = $aggSize <= 10 ? 0.03 : ($aggSize <= 20 ? 0.02 : 0.01);
    $admixtureMass = $cement * ($admixturePct / 100);

    $volCement = $cement / ($sgCement * 1000);
    $volWater = $water / 1000;
    $volAdmix = $admixtureMass / ($sgAd * 1000);
    $volAgg = 1 - ($volCement + $volWater + $volAdmix + $airContent);

    $coarseFraction = $aggSize <= 10 ? 0.5 : ($aggSize <= 20 ? 0.62 : 0.68);
    if ($wcr < 0.5) $coarseFraction += 0.01;
    if ($wcr > 0.5) $coarseFraction -= 0.01;

    $coarseAggregate = $volAgg * $coarseFraction * $sgCA * 1000;
    $fineAggregate = $volAgg * (1 - $coarseFraction) * $sgFA * 1000;

    $costs = $payload['costs'] ?? [];
    $cementRate = floatval($costs['cement'] ?? 0);
    $sandRate = floatval($costs['sand'] ?? 0);
    $gravelRate = floatval($costs['gravel'] ?? 0);
    $admixRate = floatval($costs['admixture'] ?? 0);
    $waterRate = floatval($costs['water'] ?? 0);

    $cementCost = $cement * $cementRate;
    $sandCost = $fineAggregate * $sandRate;
    $aggregateCost = $coarseAggregate * $gravelRate;
    $admixtureCost = $admixtureMass * $admixRate;
    $waterCost = $water * $waterRate;
    $totalCost = $cementCost + $sandCost + $aggregateCost + $admixtureCost + $waterCost;

    return [
        'designName' => $payload['designName'] ?? ('Mix-' . time()),
        'grade' => $grade,
        'targetMeanStrength' => round($targetMeanStrength, 2),
        'wcr' => round($wcr, 2),
        'cement' => round($cement, 2),
        'water' => round($water, 2),
        'fineAggregate' => round($fineAggregate, 2),
        'coarseAggregate' => round($coarseAggregate, 2),
        'admixtureMass' => round($admixtureMass, 2),
        'proportion' => '1 : ' . round($fineAggregate / $cement, 2) . ' : ' . round($coarseAggregate / $cement, 2),
        'totalMixVolume' => 1,
        'cementCost' => round($cementCost, 2),
        'sandCost' => round($sandCost, 2),
        'aggregateCost' => round($aggregateCost, 2),
        'admixtureCost' => round($admixtureCost, 2),
        'waterCost' => round($waterCost, 2),
        'estimatedCost' => round($totalCost, 2),
        'date' => date('Y-m-d H:i:s'),
        'id' => time()
    ];
}

if ($path === 'api.php/login' && $method === 'POST') {
    $body = readJsonBody();
    $email = trim($body['email'] ?? 'student@demo.com');
    send(['success' => true, 'message' => 'Login success', 'user' => ['email' => $email]]);
}

if ($path === 'api.php/calculate' && $method === 'POST') {
    $body = readJsonBody();
    $result = calculateMix($body);
    send(['success' => true, 'data' => $result]);
}

if ($path === 'api.php/designs' && $method === 'GET') {
    send(['success' => true, 'data' => loadDesigns()]);
}

if ($path === 'api.php/designs' && $method === 'POST') {
    $body = readJsonBody();
    $designs = loadDesigns();
    $body['id'] = $body['id'] ?? time();
    $designs[] = $body;
    saveDesigns($designs);
    send(['success' => true, 'message' => 'Saved', 'data' => $body]);
}

if ($path === 'api.php/designs' && $method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    $designs = loadDesigns();
    $filtered = array_values(array_filter($designs, fn($d) => intval($d['id'] ?? 0) !== $id));
    saveDesigns($filtered);
    send(['success' => true, 'message' => 'Deleted']);
}

send(['success' => false, 'message' => 'Route not found', 'path' => $path], 404);

<?php
header("Content-Type: application/json");

$configFile = __DIR__ . "/robot002.json";

// Lire le JSON envoyé par Astro
$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

// DEBUG TEMPORAIRE
file_put_contents(__DIR__ . "/debug.log", "RAW: " . $raw . "\n", FILE_APPEND);

if (!is_array($input)) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON", "raw" => $raw]);
    exit;
}

// Charger la configuration existante
$config = file_exists($configFile)
    ? json_decode(file_get_contents($configFile), true)
    : [];

// Mise à jour des champs
$fields = [
    "active",
    "to",
    "prompt",
    "frequency_minutes",
    "region",
    "min_price_eur",
    "sources"
];

foreach ($fields as $f) {
    if (isset($input[$f])) {
        $config[$f] = $input[$f];
    }
}

// Sauvegarde
file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok", "saved" => $config]);
<?php
header("Content-Type: application/json");

$configFile = __DIR__ . "/robot002.json";

// Charger la configuration
$config = [];
if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true);
}
if (!is_array($config)) {
    $config = [];
}

// Valeurs par défaut si manquantes
$status = [
    "active" => $config["active"] ?? false,
    "to" => $config["to"] ?? "",
    "prompt" => $config["prompt"] ?? "",
    "frequency_minutes" => $config["frequency_minutes"] ?? 5,

    // Champs immobiliers
    "region" => $config["region"] ?? "France",
    "min_price_eur" => $config["min_price_eur"] ?? 0,
    "sources" => $config["sources"] ?? [],

    // Informations runtime
    "last_sent" => $config["last_sent"] ?? null,
    "next_run" => $config["next_run"] ?? null,
    "log_tail" => []
];

// Charger les logs si présents
$logFile = __DIR__ . "/robot002.log";
if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $status["log_tail"] = array_slice($lines, -20);
}

echo json_encode($status);
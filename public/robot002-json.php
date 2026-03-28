<?php
ob_clean();
header("Content-Type: application/json; charset=utf-8");

$configFile = __DIR__ . "/robot002.json";

if (!file_exists($configFile)) {
    echo json_encode(["error" => "robot002.json not found"]);
    exit;
}

echo file_get_contents($configFile);
<?php
ob_clean();
header("Content-Type: application/json");

$configFile = "robot002.json";
$logFile = "robot002.log";

if (!file_exists($configFile)) {
    echo json_encode(["status" => "error", "message" => "No config"]);
    exit;
}

$config = json_decode(file_get_contents($configFile), true);

if (!$config["active"]) {
    echo json_encode(["status" => "ok", "message" => "Robot disabled"]);
    exit;
}

$now = time();
$lastSent = $config["last_sent"] ? strtotime($config["last_sent"]) : 0;
$interval = $config["frequency_minutes"] * 60;

if ($now - $lastSent < $interval) {
    echo json_encode(["status" => "ok", "message" => "Not time yet"]);
    exit;
}

file_get_contents("https://xperruche-robot002.hf.space/");
sleep(2);

$payload = [
    "data" => [
        json_encode([
            "region" => $config["region"],
            "min_price_eur" => (int)$config["min_price_eur"],
            "sources" => $config["sources"]
        ])
    ]
];

$ch = curl_init("https://xperruche-robot002.hf.space/run/predict");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if ($response === false) {
    file_put_contents($logFile, date("c") . " HF ERROR: " . curl_error($ch) . "\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => curl_error($ch)]);
    exit;
}

curl_close($ch);

$result = json_decode($response, true);

if (!$result) {
    file_put_contents($logFile, date("c") . " INVALID JSON: " . substr($response, 0, 200) . "\n", FILE_APPEND);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON",
        "raw" => substr($response, 0, 500)
    ]);
    exit;
}

$emailContent = $result["data"][0] ?? "Message automatique.";

$to = $config["to"];
$subject = "Message automatique Robot002";

$headers = "From: wepopup@wepopup.net\r\n";
$headers .= "Reply-To: wepopup@wepopup.net\r\n";

if (!mail($to, $subject, $emailContent, $headers)) {
    file_put_contents($logFile, date("c") . " MAIL ERROR\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "mail() failed"]);
    exit;
}

$config["last_sent"] = date("c");
file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));

file_put_contents($logFile, date("c") . " CRON email sent\n", FILE_APPEND);

echo json_encode(["status" => "ok", "message" => "Email sent"]);
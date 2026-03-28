<?php
ob_clean();
header("Content-Type: application/json; charset=utf-8");

// Charger config
$config = json_decode(file_get_contents("robot002.json"), true);

// Le robot peut être désactivé, mais l’envoi manuel reste autorisé
//if (!$config["active"]) {
//    echo json_encode(["status" => "error", "message" => "Robot disabled"]);
//    exit;
//}

// Appel HuggingFace
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
curl_close($ch);

$result = json_decode($response, true);
$emailContent = $result["data"][0] ?? "Message automatique.";

// Envoi email
mail($config["to"], "Message automatique Robot002", $emailContent);

echo json_encode(["status" => "ok"]);
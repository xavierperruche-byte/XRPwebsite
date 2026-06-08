<?php
ob_clean();
header("Content-Type: application/json; charset=utf-8");

// 1. Charger la configuration locale
if (!file_exists("robot002.json")) {
    echo json_encode(["status" => "error", "message" => "Fichier de configuration manquant"]);
    exit;
}

$config = json_decode(file_get_contents("robot002.json"), true);

// 2. Préparer le payload pour Hugging Face (Mistral Large)
// Ajout du paramètre "prompt" pour correspondre exactement à ce qu'attend app.py
$payload = [
    "data" => [
        json_encode([
            "region" => $config["region"] ?? "France",
            "min_price_eur" => (int)($config["min_price_eur"] ?? 1000000),
            "sources" => $config["sources"] ?? ["leboncoin"],
            "prompt" => $config["prompt"] ?? "" 
        ])
    ]
];

// 3. Appel à Hugging Face Space
$ch = curl_init("https://xperruche-robot002.hf.space/run/predict");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Sécurité : laisse le temps à l'IA de répondre

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
$emailContent = $result["data"][0] ?? "Message automatique (Aucun contenu généré par l'IA).";

// 4. Routage de l'e-mail vers votre script SMTP (PHPMailer) au lieu de mail()
// On utilise cURL pour appeler localement send-email.php
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
$localEmailUrl = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . "/send-email.php";

$emailPayload = [
    "to" => $config["to"],
    "subject" => "⚡ Rapport Immobilier Premium - Robot002",
    "message" => $emailContent // Transmis proprement sous la clé 'message' attendue par votre PHP
];

$chEmail = curl_init($localEmailUrl);
curl_setopt($chEmail, CURLOPT_POST, true);
curl_setopt($chEmail, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($chEmail, CURLOPT_POSTFIELDS, json_encode($emailPayload));
curl_setopt($chEmail, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chEmail, CURLOPT_SSL_VERIFYPEER, false); // Évite les blocages SSL en local / sous-domaine

$emailResponse = curl_exec($chEmail);
curl_close($chEmail);

$emailResult = json_decode($emailResponse, true);

// 5. Réponse finale pour l'interface Astro
if ($emailResult && isset($emailResult["success"]) && $emailResult["success"] === true) {
    echo json_encode(["status" => "ok"]);
} else {
    $errorMsg = $emailResult["message"] ?? "Erreur SMTP inconnue";
    echo json_encode(["status" => "error", "message" => "L'IA a répondu mais le mail a échoué : " . $errorMsg]);
}
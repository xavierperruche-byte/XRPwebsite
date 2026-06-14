<?php
// À AJOUTER EN TOUT DÉBUT DE FICHIER :
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// verify.php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- RÉCUPÉRATION ROBUSTE DE LA CLÉ RECAPTCHA ---
$recaptchaSecret = getenv('RECAPTCHA_SECRET_KEY') 
    ?: (getenv('REDIRECT_RECAPTCHA_SECRET_KEY') 
    ?: ($_SERVER['RECAPTCHA_SECRET_KEY'] 
    ?: ($_SERVER['REDIRECT_RECAPTCHA_SECRET_KEY'] ?? null)));

// --- RÉCUPÉRATION ROBUSTE DE LA CLÉ NEVERBOUNCE (Correction du nom ici) ---
$neverBounceKey = getenv('NEVERBOUNCE_API_KEY') 
    ?: (getenv('REDIRECT_NEVERBOUNCE_API_KEY') 
    ?: ($_SERVER['NEVERBOUNCE_API_KEY'] 
    ?: ($_SERVER['REDIRECT_NEVERBOUNCE_API_KEY'] ?? null)));

// --- SÉCURITÉ ET DIAGNOSTIC INITIAL ---
if (!$recaptchaSecret || !$neverBounceKey) {
    echo json_encode([
        'isValid' => false,
        'error' => 'configuration_error',
        'message' => 'Erreur de configuration des clés d\'API en production.',
        'missing' => [
            'recaptcha' => !$recaptchaSecret,
            'neverbounce' => !$neverBounceKey
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $recaptchaToken = $input['recaptcha_token'] ?? '';

    if (empty($email)) {
        echo json_encode(['isValid' => false, 'error' => 'Email manquant']);
        exit;
    }

    // 1. VÉRIFICATION DU RECAPTCHA
    if (!empty($recaptchaToken)) {
        $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        $verifyData = [
            'secret'   => $recaptchaSecret,
            'response' => $recaptchaToken,
            'remoteip' => $_SERVER['REMOTE_ADDR']
        ];

        $verifyOptions = [
            'http' => [
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($verifyData)
            ]
        ];
        $verifyContext  = stream_context_create($verifyOptions);
        $verifyResult   = file_get_contents($verifyUrl, false, $verifyContext);
        $verifyResponse = json_decode($verifyResult, true);

        // Si Google renvoie un échec ou un score de robot trop bas (seuil classique à 0.5)
        if (!$verifyResponse['success'] || (isset($verifyResponse['score']) && $verifyResponse['score'] < 0.5)) {
            error_log("reCAPTCHA bloqué : Score insuffisant ou jeton invalide.");
            echo json_encode([
                'isValid' => false, 
                'error' => 'Validation de sécurité échouée',
                'debug_google' => $verifyResponse // Injecte la réponse de Google pour votre onglet Réseau
            ]);
            exit;
        }
    }

// 2. VÉRIFICATION NEVERBOUNCE (DESACTIVÉE POUR TEST)
    // On court-circuite la vérification et on valide automatiquement à true
    echo json_encode([
        'isValid' => true,
        'debug_neverbounce' => 'Désactivé pour débogage'
    ]);
    exit;

    // 2. VÉRIFICATION NEVERBOUNCE
/*     $url = "https://api.neverbounce.com/v1/single/check";
    $data = [
        'email' => $email,
        'api_key' => $neverBounceKey
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
            'ignore_errors' => true
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result, true);

    // Réponse finale attendue par votre script JS
    echo json_encode([
        'isValid' => isset($response['result']) && $response['result'] === 'valid',
        'debug_neverbounce' => $response // Injecte la réponse de NeverBounce pour votre onglet Réseau
    ]);
    exit;
 */}
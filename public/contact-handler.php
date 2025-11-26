<?php
// Désactiver l'affichage des erreurs en production
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// --- PHPMailer ---
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';
require_once 'PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// --- CONFIGURATION ---
$recipient_email = "REJANE.WE.THEAGENCY@GMAIL.COM";
$sender_email = "wepopup@wepopup.net";
$sender_password = "@Vhtg19151702"; // ⚠️ Mettez le mot de passe qui a fonctionné dans le test
$recaptcha_secret_key = "6LdmWBcsAAAAAOtmEU8h2FFvskpie_4Doa86MZ1r";

// Fonction pour envoyer une réponse JSON
function sendResponse($success, $message = '') {
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Vérifier la méthode POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    sendResponse(false, "Invalid request method");
}

// --- Vérification reCAPTCHA ---
if (!isset($_POST['recaptcha_token']) || empty($_POST['recaptcha_token'])) {
    http_response_code(400);
    sendResponse(false, "Missing reCAPTCHA token");
}

$recaptcha_token = $_POST['recaptcha_token'];

$recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
$recaptcha_data = [
    'secret' => $recaptcha_secret_key,
    'response' => $recaptcha_token,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($recaptcha_data),
        'timeout' => 10
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($recaptcha_url, false, $context);

if ($response === false) {
    http_response_code(500);
    sendResponse(false, "Unable to verify reCAPTCHA");
}

$captcha = json_decode($response, true);

if (!$captcha || !isset($captcha['success']) || !$captcha['success']) {
    http_response_code(400);
    sendResponse(false, "reCAPTCHA verification failed");
}

if (!isset($captcha['score']) || $captcha['score'] < 0.5) {
    http_response_code(400);
    sendResponse(false, "reCAPTCHA score too low");
}

// --- Validation et nettoyage des données ---
$name = isset($_POST["name"]) ? trim($_POST["name"]) : '';
$email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
$subject = isset($_POST["subject"]) ? trim($_POST["subject"]) : '';
$message = isset($_POST["message"]) ? trim($_POST["message"]) : '';

// Validation des champs requis
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    sendResponse(false, "All fields are required");
}

// Validation de l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    sendResponse(false, "Invalid email address");
}

// Validation de la longueur
if (strlen($name) > 100 || strlen($email) > 255 || strlen($subject) > 200 || strlen($message) > 5000) {
    http_response_code(400);
    sendResponse(false, "Input too long");
}

// Nettoyage des données
$name = strip_tags($name);
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$subject = strip_tags($subject);
$message = strip_tags($message);

// --- Construction du message ---
$email_body = "Nouveau message de contact depuis We The Agency\n\n";
$email_body .= "═══════════════════════════════════════\n\n";
$email_body .= "Nom: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Sujet: " . $subject . "\n\n";
$email_body .= "Message:\n" . str_repeat("─", 40) . "\n";
$email_body .= $message . "\n";
$email_body .= str_repeat("─", 40) . "\n\n";
$email_body .= "═══════════════════════════════════════\n";
$email_body .= "Informations système:\n";
$email_body .= "Date: " . date('d/m/Y H:i:s') . "\n";
$email_body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
$email_body .= "reCAPTCHA score: " . $captcha['score'] . "\n";

// --- Envoi via PHPMailer avec SMTP ---
$mail = new PHPMailer(true);

try {
    // Configuration SMTP (utilisez la config qui a fonctionné dans le test)
    $mail->isSMTP();
    $mail->Host = 'mail.wepopup.net';
    $mail->SMTPAuth = true;
    $mail->Username = $sender_email;
    $mail->Password = $sender_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Si le test a utilisé SSL
    $mail->Port = 465; // Si le test a utilisé 465
    
    // Si le test a utilisé STARTTLS et port 587, utilisez plutôt :
    // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    // $mail->Port = 587;
    
    $mail->CharSet = 'UTF-8';
    
    // Options SSL (comme dans le test)
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    
    // Timeout
    $mail->Timeout = 30;
    
    // Désactiver le debug en production
    $mail->SMTPDebug = SMTP::DEBUG_OFF;
    
    // Expéditeur et destinataire
    $mail->setFrom($sender_email, 'We The Agency - Contact Form');
    $mail->addAddress($recipient_email, 'Xavier Perruche');
    $mail->addReplyTo($email, $name);
    
    // Contenu
    $mail->isHTML(false);
    $mail->Subject = '[We The Agency] ' . $subject;
    $mail->Body = $email_body;
    
    // Envoi
    if ($mail->send()) {
        http_response_code(200);
        sendResponse(true, "Thank you! Your message has been sent.");
    } else {
        throw new Exception("Mail send failed");
    }
    
} catch (Exception $e) {
    // Log l'erreur (ne pas l'exposer à l'utilisateur)
    error_log("PHPMailer Error: " . $mail->ErrorInfo);
    error_log("Exception: " . $e->getMessage());
    
    http_response_code(500);
    sendResponse(false, "Unable to send message. Please try again later.");
}
<?php
date_default_timezone_set('Europe/Paris');
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

// Fonction pour créer une instance PHPMailer configurée
function createMailer($sender_email, $sender_password) {
    $mail = new PHPMailer(true);
    
    // Configuration SMTP
    $mail->isSMTP();
    $mail->Host = 'mail.wepopup.net';
    $mail->SMTPAuth = true;
    $mail->Username = $sender_email;
    $mail->Password = $sender_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';
    
    // Options SSL
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    
    $mail->Timeout = 30;
    $mail->SMTPDebug = SMTP::DEBUG_OFF;
    
    return $mail;
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

// --- EMAIL 1 : Notification pour vous (admin) ---
$admin_email_body = "Nouveau message de contact depuis We The Agency\n\n";
$admin_email_body .= "═══════════════════════════════════════\n\n";
$admin_email_body .= "Nom: " . $name . "\n";
$admin_email_body .= "Email: " . $email . "\n";
$admin_email_body .= "Sujet: " . $subject . "\n\n";
$admin_email_body .= "Message:\n" . str_repeat("─", 40) . "\n";
$admin_email_body .= $message . "\n";
$admin_email_body .= str_repeat("─", 40) . "\n\n";
$admin_email_body .= "═══════════════════════════════════════\n";
$admin_email_body .= "Informations système:\n";
$admin_email_body .= "Date: " . date('d/m/Y H:i:s') . "\n";
$admin_email_body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
$admin_email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
$admin_email_body .= "reCAPTCHA score: " . $captcha['score'] . "\n";

// --- EMAIL 2 : Confirmation pour le demandeur (HTML) ---
$user_email_html = '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation - We The Agency</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

                    <!-- Header avec logo -->
                    <tr>
                        <td style="background:  #f4f4f4; padding: 40px 20px; text-align: center;">
                            <img src="https://we-theagency.com/images/logo.jpg" alt="We-TheAgency" style="max-width: 100px; height: auto; margin-bottom: 10px;border-radius: 10px;" />
                            <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 600;">We-TheAgency</h1>
                        </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px;">Bonjour ' . htmlspecialchars($name) . ',</h2>
                            
                            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                                Merci de nous avoir contactés !
                            </p>
                            
                            <p style="color: #4a5568; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
                            </p>
                            
                            <!-- Récapitulatif -->
                            <div style="background-color: #f7fafc; border-left: 4px solid #686f8d; padding: 20px; margin: 30px 0; border-radius: 5px;">
                                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">📋 Récapitulatif de votre demande</h3>
                                
                                <p style="margin: 10px 0; color: #4a5568;">
                                    <strong style="color: #2d3748;">Sujet :</strong><br>
                                    ' . htmlspecialchars($subject) . '
                                </p>
                                
                                <p style="margin: 15px 0 0 0; color: #4a5568;">
                                    <strong style="color: #2d3748;">Votre message :</strong><br>
                                    <span style="display: block; margin-top: 8px; line-height: 1.6;">' . nl2br(htmlspecialchars($message)) . '</span>
                                </p>
                            </div>
                            
                            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; font-style: italic;">
                                Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #2d3748; padding: 30px; text-align: center; color: #ffffff;">
                            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">L\'équipe We-TheAgency</p>
                            
                            <div style="margin: 20px 0; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.2); border-bottom: 1px solid rgba(255,255,255,0.2);">
                                <p style="margin: 5px 0; font-size: 14px; color: #cbd5e0;">
                                    🌐 <a href="https://we-theagency.com" style="color: #fff0ea; text-decoration: none;">we-theagency.com</a>
                                </p>
                            </div>
                            
                            <p style="margin: 15px 0 0 0; font-size: 12px; color: #a0aec0;">
                                © ' . date('Y') . ' We-TheAgency - Tous droits réservés
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
';

// Version texte simple (fallback pour clients email qui ne supportent pas HTML)
$user_email_text = "Bonjour " . $name . ",\n\n";
$user_email_text .= "Merci de nous avoir contactés !\n\n";
$user_email_text .= "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.\n\n";
$user_email_text .= "Pour votre information, voici un récapitulatif de votre demande :\n\n";
$user_email_text .= "════════════════\n\n";
$user_email_text .= "Sujet: " . $subject . "\n\n";
$user_email_text .= "Votre message:\n" . str_repeat("─", 40) . "\n";
$user_email_text .= $message . "\n";
$user_email_text .= str_repeat("─", 40) . "\n\n";
$user_email_text .= "════════════════\n\n";
$user_email_text .= "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.\n\n";
$user_email_text .= "Cordialement,\n";
$user_email_text .= "L'équipe We-TheAgency\n\n";
$user_email_text .= "---\n";
$user_email_text .= "We The Agency\n";
$user_email_text .= "Web: https://we-theagency.com\n";

$email_sent_to_admin = false;
$email_sent_to_user = false;

try {
    // --- ENVOI EMAIL 1 : Notification Admin ---
    $mail_admin = createMailer($sender_email, $sender_password);
    $mail_admin->setFrom($sender_email, 'We The Agency - Contact Form');
    $mail_admin->addAddress($recipient_email, 'Xavier Perruche');
    $mail_admin->addReplyTo($email, $name);
    $mail_admin->isHTML(false);
    $mail_admin->Subject = '[We The Agency] ' . $subject;
    $mail_admin->Body = $admin_email_body;
    
    if ($mail_admin->send()) {
        $email_sent_to_admin = true;
        error_log("Admin notification sent successfully");
    }
    
} catch (Exception $e) {
    error_log("Failed to send admin notification: " . $mail_admin->ErrorInfo);
}

try {
    // --- ENVOI EMAIL 2 : Confirmation Utilisateur ---
    $mail_user = createMailer($sender_email, $sender_password);
    $mail_user->setFrom($sender_email, 'We The Agency');
    $mail_user->addAddress($email, $name);
    $mail_user->addReplyTo($sender_email, 'We The Agency');
    $mail_user->isHTML(true);
    $mail_user->Subject = 'Confirmation de votre message - We The Agency';
    $mail_user->Body = $user_email_html;
    $mail_user->AltBody = $user_email_text;
    
    if ($mail_user->send()) {
        $email_sent_to_user = true;
        error_log("User confirmation sent successfully to: " . $email);
    }
    
} catch (Exception $e) {
    error_log("Failed to send user confirmation: " . $mail_user->ErrorInfo);
}

// --- Réponse finale ---
if ($email_sent_to_admin && $email_sent_to_user) {
    http_response_code(200);
    sendResponse(true, "Merci ! Votre message a été envoyé. Vous recevrez une confirmation par email.");
} else if ($email_sent_to_admin) {
    http_response_code(200);
    sendResponse(true, "Merci ! Votre message a été envoyé.");
} else {
    http_response_code(500);
    error_log("Both emails failed to send");
    sendResponse(false, "Une erreur s'est produite. Veuillez réessayer plus tard.");
}
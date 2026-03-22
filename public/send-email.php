<?php
header('Content-Type: application/json');

// Charger PHPMailer
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';
require_once 'PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Configuration SMTP (identique à contact-handler.php)
$sender_email = "wepopup@wepopup.net";
$sender_password = "@Vhtg19151702";

function createMailer($sender_email, $sender_password) {
    $mail = new PHPMailer(true);

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

    return $mail;
}

// Lire le JSON envoyé par Robot002
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["to"]) || !isset($data["subject"]) || !isset($data["message"])) {
    echo json_encode(["success" => false, "message" => "Invalid payload"]);
    exit;
}

$to = $data["to"];
$subject = $data["subject"];
$message = $data["message"];

try {
    $mail = createMailer($sender_email, $sender_password);

    $mail->setFrom($sender_email, 'Robot002');
    $mail->addAddress($to);

    $mail->Subject = $subject;
    $mail->Body = $message;

    $mail->send();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $mail->ErrorInfo]);
}
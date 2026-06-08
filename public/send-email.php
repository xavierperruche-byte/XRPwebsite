try {
    $mail = createMailer($sender_email, $sender_password);

    $mail->CharSet = 'UTF-8';          // ← Move this FIRST
    $mail->Encoding = 'base64';        // ← Add this: forces clean base64 transfer encoding


    $mail->setFrom($sender_email, 'Robot002');
    $mail->addAddress($to);

    $mail->Subject = $subject;

// Clean markdown artifacts
$clean_message = trim($message);
$clean_message = preg_replace('/^```html\s*/m', '', $clean_message);
$clean_message = preg_replace('/^```\s*/m', '', $clean_message);
$clean_message = preg_replace('/```\s*$/m', '', $clean_message);
$clean_message = trim($clean_message);
    $mail->isHTML(true);
    $mail->Body = $html_message;

    // 3. Sécurité : On fournit une version texte brut alternative (pour les clients mail stricts)
    $mail->AltBody = strip_tags($message);

    $mail->send();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $mail->ErrorInfo]);
}

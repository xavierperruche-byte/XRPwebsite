<?php
// Configuration
$recipient_email = "REJANE.WE.THEAGENCY@GMAIL.COM"; // REPLACE WITH YOUR EMAIL
$email_subject = "New Contact Form Submission";
$recaptcha_secret_key = "6LdwdNsrAAAAAHcqUPeVRmf5BSzXwbo_pmYdrGGG"; // REPLACE WITH YOUR SECRET KEY

// Set headers for JSON response
header('Content-Type: application/json');

// Check if form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Verify reCAPTCHA
    if (!isset($_POST['recaptcha_token'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing reCAPTCHA token."]);
        exit;
    }
    
    $recaptcha_token = $_POST['recaptcha_token'];
    
    // Verify token with Google
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
            'content' => http_build_query($recaptcha_data)
        ]
    ];
    
    $context = stream_context_create($options);
    $verify = file_get_contents($recaptcha_url, false, $context);
    $captcha_success = json_decode($verify);
    
    // Check reCAPTCHA score (v3 returns a score between 0.0 and 1.0)
    if (!$captcha_success->success || $captcha_success->score < 0.5) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "reCAPTCHA verification failed. Please try again."
        ]);
        exit;
    }
    
    // Sanitize and validate input
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"]));
    $message = strip_tags(trim($_POST["message"]));
    
    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Please fill in all required fields."]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Please enter a valid email address."]);
        exit;
    }
    
    // Build email content
    $email_content = "New contact form submission:\n\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Subject: $subject\n\n";
    $email_content .= "Message:\n$message\n\n";
    $email_content .= "---\n";
    $email_content .= "reCAPTCHA Score: " . $captcha_success->score . "\n";
    $email_content .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $email_content .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
    
    // Build email headers
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "X-Mailer: PHP/" . phpversion();
    
    // Send email
    if (mail($recipient_email, $email_subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Thank you! Your message has been sent."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to send email. Please try again later."]);
    }
    
} else {
    // Not a POST request
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Invalid request method."]);
}
?>
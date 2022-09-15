<?php

// accessing form submission data
$name = $_POST['name'];
$visitor_email = $_POST['email'];
$message = $_POST['message'];

// composing email messaage
$email_from = 'segers.thomas@telenet.be';

$email_subject = "New Form submission";

$email_body = "You have received a new message from the user $name.\n".
                          "Here is the message:\n $message".

// sending the email
$to = "segers.thomas@telenet.be";

$headers = "From: $email_from \r\n";

$headers .= "Reply-To: $visitor_email \r\n";

mail($to,$email_subject,$email_body,$headers);
?>

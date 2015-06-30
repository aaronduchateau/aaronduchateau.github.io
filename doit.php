<?php 
 if(isset($_POST['submit']))  {
    $to = 'aaron@pivot2dream.com' .','.'chateauconcept@gmail.com';
    $from = "donotreply@awarelink.com";
    $subject = "AARON DU CHATEAU LEAD FROM FORM";
    $thing_two = "The Aaron DuChateau Contact Form has been submitted from " . $_POST['thing'] . " - " . $_POST['thing_2'];
    $message = "<div style=\"display:block;\">' . $thing_two . '</div>";
    $headers = "MIME-Version: 1.0 \r\n";
    $headers .= "Content-type: text/html; charset=iso-8859-1 \r\n";
    $headers  .= "From: $from\r\n";
    mail($to, $subject, $message, $headers);
    echo "Message has been sent....!";  
 }else{
    echo "Add an email address"; 
 }?>
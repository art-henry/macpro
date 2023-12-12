<?php
$cms["lang"]["star_feedback.mod.php"]["en_US.UTF-8"] = array(
    "star_feedback_module_name" => "Star reviews",
    "star_feedback_module_description" => "Calculates the average page rank",
    "feedback_sent" => "Review sent.",
    "no_connect_db" => "Please connect to the database",
    "server_overloaded_xxx" => "The server is overloaded. Sent xxx reviews.",
    "browser_overloaded_xxx" => "The browser is overloaded. Inserted xxx reviews from nnn.",
    "confirm_delete_feedbacks" => "Delete selected reviews?",
    "search" => "Search...",
    "of" => "of",
    "moderation" => "Moderation",
    "star_feedback_settings" => "Module settings",
    "save" => "Save",
    "ban_list" => "Ban list",
    "feedback_count" => "Number of reviews under the article",
    "publish" => "Publish",
    "unpublish" => "Unpublish",
    "ban" => "Ban",
    "unpublished" => "Unpublished",
    "published" => "Published",
    "limit_exceeded" => "Limit exceeded.",
    "sent_to_moderation" => "The review has been sent for moderation.",
    "mail_subject" => "Feedback on the site",
    "user_blocked" => "The user is blocked",
    "user_unblocked" => "User unblocked",
    "already_blocked" => "Already blocked",
    "feedbacks_deleted" => "Reviews removed",
    "send_feedbacks_to_email" => "Send reviews by email",
    "leave_feedback" => "Leave feedback",
    "default_admin_name" => "Default administrator name",
    "saved" => "Saved",
    "help" => "Add &lt;!-- stars --> to the page text. And reviews will be displayed in this place.",
    "smtp_host" => "SMTP Server",
    "smtp_port" => "SMTP Port",
    "smtp_login" => "SMTP Login",
    "smtp_password" => "SMTP Password",
    "label" => "Button text",
    "create_tables" => "Create tables in the database. Go to Database settings and click the Save button.",
    "lost_feedback" => "Lost feedback",
    "delete" => "Delete",
    "ok" => "Success",
    "star_1" => "Grade «1»",
    "star_2" => "Grade «2»",
    "star_3" => "Grade «3»",
    "star_4" => "Grade «4»",
    "star_5" => "Grade «5»",
    "no_selected_feedbacks" => "Select reviews first.",
);

$cms["lang"]["star_feedback.mod.php"]["frontend"]["en_US.UTF-8"] = array(
    "name" => "Name",
    "message" => "Review",
    "send" => "Send",
    "moderated" => "Reviews are moderated",
    "email_for_reply" => "Email for reply",
    "empty_name" => "No name provided.",
    "empty_message" => "Empty review.",
    "star_1" => "Grade «1»",
    "star_2" => "Grade «2»",
    "star_3" => "Grade «3»",
    "star_4" => "Grade «4»",
    "star_5" => "Grade «5»",
);

function star_feedback_stars_en( $count ) {
    $locale_info = localeconv();

    $parts = explode( $locale_info['decimal_point'], $count );
    if ( isset( $parts[1] ) ) {
        $count = $parts[1];
    }

    switch ( $count ) {
        case 1: return "star"; break;
        default: return "stars"; break;
    }
}

function star_feedback_feedbacks_en( $count ) {
    switch ( $count ) {
        case 1: return "review"; break;
        default: return "reviews"; break;
    }
}
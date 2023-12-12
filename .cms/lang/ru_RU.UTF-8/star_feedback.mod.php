<?php
$cms["lang"]["star_feedback.mod.php"]["ru_RU.UTF-8"] = array(
    "star_feedback_module_name" => "Звездные отзывы",
    "star_feedback_module_description" => "Подсчитывает средний рейтинг страницы",
    "feedback_sent" => "Отзыв отправлен.",
    "no_connect_db" => "Пожалуйста, подключитесь к базе данных",
    "server_overloaded_xxx" => "Сервер перегружен. Прислал xxx отзывов.",
    "browser_overloaded_xxx" => "Браузер перегружен. Вставил xxx отзывов из nnn.",
    "confirm_delete_feedbacks" => "Удалить выбранные отзывы?",
    "search" => "Поиск...",
    "of" => "из",
    "moderation" => "Модерация",
    "star_feedback_settings" => "Настройки модуля",
    "save" => "Сохранить",
    "ban_list" => "Список забаненных",
    "feedback_count" => "Количество отзывов под статьей",
    "publish" => "Опубликовать",
    "unpublish" => "Скрыть",
    "ban" => "Забанить",
    "unpublished" => "Снято с публикации",
    "published" => "Опубликовано",
    "limit_exceeded" => "Лимит превышен.",
    "sent_to_moderation" => "Отзыв отправлен на модерацию.",
    "mail_subject" => "Отзыв на сайте",
    "user_blocked" => "Пользователь заблокирован",
    "user_unblocked" => "Пользователь разблокирован",
    "already_blocked" => "Уже заблокирован",
    "feedbacks_deleted" => "Отзывы удалены",
    "send_feedbacks_to_email" => "Отправлять отзывы на почту",
    "leave_feedback" => "Оставить отзыв",
    "default_admin_name" => "Имя администратора по умолчанию",
    "saved" => "Сохранено",
    "help" => "В текст страницы добавьте &lt;!-- stars -->. И отзывы будут отображаться в этом месте.",
    "smtp_host" => "SMTP Сервер",
    "smtp_port" => "SMTP Порт",
    "smtp_login" => "SMTP Логин",
    "smtp_password" => "SMTP Пароль",
    "label" => "Текст на кнопке",
    "create_tables" => "Создайте таблицы в базе данных. Перейдите в настройки Базы данных и нажмите кнопку Сохранить.",
    "lost_feedback" => "Потерянный отзыв",
    "delete" => "Удалить",
    "ok" => "Успешно",
    "star_1" => "Оценка «1»",
    "star_2" => "Оценка «2»",
    "star_3" => "Оценка «3»",
    "star_4" => "Оценка «4»",
    "star_5" => "Оценка «5»",
    "no_selected_feedbacks" => "Сначала выберите отзывы.",
);

$cms["lang"]["star_feedback.mod.php"]["frontend"]["ru_RU.UTF-8"] = array(
    "name" => "Имя",
    "message" => "Отзыв",
    "send" => "Отправить",
    "moderated" => "Отзывы модерируются",
    "email_for_reply" => "Эл. почта для ответа",
    "empty_name" => "Не указано имя.",
    "empty_message" => "Пустой отзыв.",
    "star_1" => "Оценка «1»",
    "star_2" => "Оценка «2»",
    "star_3" => "Оценка «3»",
    "star_4" => "Оценка «4»",
    "star_5" => "Оценка «5»",
);

function star_feedback_stars_ru( $count ) {
    $locale_info = localeconv();

    $parts = explode( $locale_info['decimal_point'], $count );
    if ( isset( $parts[1] ) ) {
        $count = $parts[1];
    }

    $remainder = $count % 10;

    // исключения из правил
    if ( $count == 11 || $count >= 12 && $count <= 14 ) {
        return "звёзд";
    }

    switch ( $remainder ) {
        case 1: return "звезда"; break;
        case 2:
        case 3:
        case 4: return "звезды"; break;
        default: return "звёзд"; break;
    }
}

function star_feedback_feedbacks_ru( $count ) {
    $remainder = $count % 10;

    // исключения из правил
    if ( $count == 11 || $count >= 12 && $count <= 14 ) {
        return "отзывов";
    }

    switch ( $remainder ) {
        case 1: return "отзыв"; break;
        case 2:
        case 3:
        case 4: return "отзыва"; break;
        default: return "отзывов"; break;
    }
}
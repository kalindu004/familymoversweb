<?php
/**
 * Same-origin quote handler for the Family Movers website.
 * POST JSON or form fields. Sends plain text with PHP mail().
 * Do not proxy this form to StoreIt's send-enquiry.php.
 */
declare(strict_types=1);

const RECIPIENT = 'info@familymovers.lk';
const FROM_ADDRESS = 'noreply@familymovers.lk';
const SUBJECT = 'Family Movers website quote request';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$limits = [
    'name' => 100,
    'phone' => 40,
    'email' => 150,
    'move_date' => 20,
    'loading_address' => 1000,
    'unloading_address' => 1000,
    'goods' => 2000,
    'remarks' => 2000,
];

$contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 20000) {
        respond(400, ['ok' => false, 'error' => 'The request is too large.']);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        respond(400, ['ok' => false, 'error' => 'The request was not valid JSON.']);
    }
    $input = $decoded;
} else {
    $input = $_POST;
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function clean_text($value, bool $singleLine): string
{
    if (!is_string($value) && !is_numeric($value)) {
        return '';
    }
    $value = str_replace("\0", '', (string) $value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    if ($singleLine) {
        $value = str_replace(["\n", "\t"], ' ', $value);
    }
    return trim($value);
}

$singleLine = ['name' => true, 'phone' => true, 'email' => true, 'move_date' => true];
$fields = [];
foreach ($limits as $key => $max) {
    $fields[$key] = clean_text($input[$key] ?? '', $singleLine[$key] ?? false);
    if (text_length($fields[$key]) > $max) {
        respond(400, ['ok' => false, 'error' => 'One of the fields is too long.']);
    }
}

foreach (['name', 'phone', 'email', 'move_date', 'loading_address', 'unloading_address', 'goods'] as $key) {
    if ($fields[$key] === '') {
        respond(400, ['ok' => false, 'error' => 'Please complete all required fields.']);
    }
}

$email = $fields['email'];
if (preg_match('/[\r\n]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['ok' => false, 'error' => 'Please enter a valid email address.']);
}

$digits = preg_replace('/\D+/', '', $fields['phone']);
if (!is_string($digits) || strlen($digits) < 7 || strlen($digits) > 15) {
    respond(400, ['ok' => false, 'error' => 'Please enter a valid contact number.']);
}

$date = DateTime::createFromFormat('!Y-m-d', $fields['move_date']);
$dateErrors = DateTime::getLastErrors();
if (
    !$date
    || $date->format('Y-m-d') !== $fields['move_date']
    || (is_array($dateErrors) && (($dateErrors['warning_count'] ?? 0) > 0 || ($dateErrors['error_count'] ?? 0) > 0))
) {
    respond(400, ['ok' => false, 'error' => 'Please enter a valid moving date.']);
}

$labels = [
    'name' => 'Name',
    'phone' => 'Contact Number',
    'email' => 'Email',
    'move_date' => 'Date of Moving',
    'loading_address' => 'Loading Address & Floor(s)',
    'unloading_address' => 'Unloading Address & Floor(s)',
    'goods' => 'Description of Goods',
    'remarks' => 'Special Remarks',
];

$lines = [SUBJECT, ''];
foreach ($labels as $key => $label) {
    $value = $fields[$key] !== '' ? $fields[$key] : '(none)';
    $lines[] = $label . ':';
    $lines[] = $value;
    $lines[] = '';
}
$body = implode("\n", $lines);

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Family Movers Website <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
]);

if (!function_exists('mail')) {
    respond(500, ['ok' => false, 'error' => 'Email is not available on this server.']);
}

$sent = @mail(RECIPIENT, SUBJECT, $body, $headers, '-f' . FROM_ADDRESS);
if ($sent !== true) {
    respond(500, ['ok' => false, 'error' => 'The enquiry could not be sent. Please try again.']);
}

respond(200, ['ok' => true]);

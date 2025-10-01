<?php
$baseApiUrl = "https://host.avalnetwork.top/bot/api/v1";

$path = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$relativePath = substr($path, strlen($scriptName));
$apiUrl = $baseApiUrl . $relativePath;

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

// Forward only essential headers
$forwardedHeaders = [];
$allHeaders = getallheaders();
if (isset($allHeaders['Authorization'])) {
    $forwardedHeaders[] = "Authorization: " . $allHeaders['Authorization'];
}
$forwardedHeaders[] = 'Expect:'; // disable 100-continue
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardedHeaders);

// Handle POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);

    // Use $_POST array instead of php://input
    $postData = [];
    foreach ($_POST as $key => $value) {
        $postData[$key] = $value;
    }
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // cURL will create correct multipart/form-data
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy cURL Error', 'message' => $curlError]);
    exit;
}

http_response_code($httpCode);
header("Content-Type: application/json");
echo $response;

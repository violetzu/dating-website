<?php
require __DIR__ . '/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use React\Socket\SecureServer;
use React\Socket\Server as ReactServer;
use MyApp\Chat;

$loop = React\EventLoop\Factory::create();
$webSock = new ReactServer('0.0.0.0:8090', $loop);

$secureWebSock = new SecureServer($webSock, $loop, [
    'local_cert' => 'C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.pem',
    'local_pk' => 'C:/wamp64/bin/apache/apache2.4.59/conf/certs/server.key',
    'allow_self_signed' => true,
    'verify_peer' => false
]);

$wsServer = new WsServer(new Chat());
$wsServer->setStrictSubProtocolCheck(false);

$ioServer = new IoServer(
    new HttpServer(
        $wsServer
    ),
    $secureWebSock,
    $loop
);

$loop->run();

function logError($message) {
    error_log($message, 3, 'C:/wamp64/www/main/error.log');
}

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    logError("Error [$errno]: $errstr in $errfile on line $errline\n");
});

set_exception_handler(function ($exception) {
    logError("Uncaught exception: " . $exception->getMessage() . "\n");
});

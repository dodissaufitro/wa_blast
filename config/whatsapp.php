<?php

return [

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Gateway Service Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for the background Node.js WhatsApp Baileys Gateway.
    |
    */

    'port' => (int) env('WA_PORT', 3001),

    'gateway_url' => env('WA_GATEWAY_URL', 'http://127.0.0.1:3001'),

    'timeout' => (int) env('WA_TIMEOUT', 30),

    'session_prefix' => env('WA_SESSION_PREFIX', 'user_'),

];

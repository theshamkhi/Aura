<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the log settings for when a location is not found
    | for the IP provided.
    |
    */

    'log_failures' => true,

    /*
    |--------------------------------------------------------------------------
    | Include Currency in Results
    |--------------------------------------------------------------------------
    |
    | When enabled the system will do it's best in deciding the user's currency
    | by matching their ISO code to a preset list of currencies.
    |
    */

    'include_currency' => false,

    /*
    |--------------------------------------------------------------------------
    | Default Service
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default storage driver that should be used
    | by the framework using the services listed below.
    |
    */

    'service' => 'ipgeolocation',
    
    /*
    |--------------------------------------------------------------------------
    | Storage Specific Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure as many storage drivers as you wish.
    |
    */

    'ipgeolocation' => [
        'class' => \Torann\GeoIP\Services\IPGeoLocation::class,
        'secure' => true,
        'key' => env('IPGEOLOCATION_KEY'),
        'continent_path' => storage_path('app/continents.json'),
        'lang' => 'en',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Cache Driver
    |--------------------------------------------------------------------------
    |
    | Here you may specify the type of caching that should be used
    | by the package.
    |
    | Options:
    |
    |  all  - All location are cached
    |  some - Cache only the requesting user
    |  none - Disable cached
    |
    */

    'cache' => env('GEOIP_CACHE', 'some'),

    /*
    |--------------------------------------------------------------------------
    | Cache Tags
    |--------------------------------------------------------------------------
    |
    | Cache tags are not supported when using the file or database cache
    | drivers in Laravel. This is done so that only locations can be cleared.
    |
    */

    'cache_tags' => null,

    /*
    |--------------------------------------------------------------------------
    | Cache Expiration
    |--------------------------------------------------------------------------
    |
    | Define how long cached location are valid.
    |
    */

    'cache_expires' => 1440, // 24 hours in minutes

    /*
    |--------------------------------------------------------------------------
    | Default Location
    |--------------------------------------------------------------------------
    |
    | Return when a location is not found.
    |
    */

    'default_location' => [
        'ip' => '127.0.0.0',
        'iso_code' => 'WA',
        'country' => 'Walo',
        'city' => 'Walo',
        'state' => 'XX',
        'state_name' => 'Uknown',
        'postal_code' => 'XXX',
        'lat' => 0,
        'lon' => 0,
        'timezone' => 'UTC',
        'continent' => 'NA',
        'currency' => 'MAD',
    ],

];

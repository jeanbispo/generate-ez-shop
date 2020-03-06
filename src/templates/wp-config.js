  /**
   * Template wp config
   * @param {string} salt
   * @returns {string} 
   */

  const dotenv = require('dotenv').config({  
    path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod"
  }).parsed;

  module.exports = (salt, dbName) => { 
    
    const content = `
    <?php

        define('DB_NAME', '${dbName}');
        define('DB_USER', ${dotenv.DB_USER});
        define('DB_PASSWORD', ${dotenv.DB_PASSWORD});
        define('DB_HOST', ${dotenv.DB_HOST});
        define('DB_CHARSET', 'utf8');
        define('DB_COLLATE', '');

        ${salt}

        $table_prefix = 'ez_';
        define('WP_DEBUG', false);

        if ( !defined('ABSPATH') )
            define('ABSPATH', dirname(__FILE__) . '/');

        require_once(ABSPATH . 'wp-settings.php');
    
    `;
    
    return content;
    
    }
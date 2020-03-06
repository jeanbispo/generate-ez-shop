'use strict'

const nginxhost = require('./nginxhost');
const wp_config = require('./wp-config');
class Templates {
    
  /**
   * Template nginx host
   * @param {string} url
   * @param {string} folder
   *  @returns {string} 
   */

    nginxhost(url, folder){
        return nginxhost(url, folder)
    }

    wp_config(salt, dbName){
        return wp_config(salt, dbName)
    }

    
 
}

module.exports = Templates

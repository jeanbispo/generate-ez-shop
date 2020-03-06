  /**
   * Template nginx host
   * @param {string} url
   * @param {string} folder
   * @returns {string} 
   */

module.exports = (url, folder) => { 
    
const content = `
   server {
    listen 80;
          server_name ${url};
          root ${folder};
          index index.php;
  
          location = /favicon.ico {
                  log_not_found off;
                  access_log off;
          }
  
          location = /robots.txt {
                  allow all;
                  log_not_found off;
                  access_log off;
          }
  
          location / {
                  try_files $uri $uri/ /index.php?$args;
          }
  
          location ~ \.php$ {
                  include fastcgi.conf;
                  fastcgi_intercept_errors on;
                  fastcgi_pass php;
         include fastcgi_params;
      fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
          }
  
          location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                  expires max;
                  log_not_found off;
          }
  }

`;

return content;

}
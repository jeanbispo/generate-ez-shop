'use strict'

const fs = require('fs');
const mysql = require('mysql2-promise')();
const shell = require('shelljs');
const axios = require('axios').default;
const dotenv = require('dotenv').config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod"
}).parsed;

const Templates = require('./templates')
const templates = new Templates;
const Ez = require('./util/global')


const origin = dotenv.ORIGIN_SHOP_DIR;
const storesFolder = dotenv.ALL_STORES_FOLDER;
const vhostFolder = dotenv.VHOST_FOLDER;

class GenerateShop extends Ez {

  /**
   * Create shop folder
   * 
   * @param {string} foldername
   * @returns {Promise} This Promise return boolean or string
   * @async
   * @private
   */

  async createFolder(foldername) {
    console.log('********* 1 ***********');
    if (!fs.existsSync(`${storesFolder}/${foldername}`)) {

      let createDirComand = shell.exec(`mkdir ${storesFolder}/${foldername}; mkdir ${storesFolder}/${foldername}/wp-content`)
      if (createDirComand.code !== 0) throw createDirComand.stderr;
      return true
    }

    throw 'Já existe uma pasta com o mesmo nome';
  }

  /**
   * Create symbolic link
   * 
   * @param {string} foldername
   * @param {string} originAbsolutePath
   * @returns {Promise} This Promise return boolean or string
   * @async
   * @private
   */

  async createSymlink(foldername, originAbsolutePath) {

    console.log('********* 2 ***********');

    let archives = fs.readdirSync(originAbsolutePath)


    let filesForDelete = ['.git', '.gitignore', 'Dumps', 'license.txt', 'readme.html', 'wp-config-dev.php', 'wp-config-prod.php', 'wp-config-sample.php', 'wp-config.php', 'wp-content'],
      contentFilesforLink = ['wp-content/languages', 'wp-content/plugins', 'wp-content/themes', 'wp-content/index.php'];

    let filesToLink = await archives.filter(obj => {
      return filesForDelete.indexOf(obj) == -1
    });

    filesToLink = await filesToLink.concat(contentFilesforLink);

    await filesToLink.map((value, index, array) => {
      let createSymLinkComand = shell.exec(`ln -s ${originAbsolutePath}/${value} ${storesFolder}/${foldername}/${value}`)
      if (createSymLinkComand.code !== 0) {
        throw createSymLinkComand.stderr;
      }
    });

    return true;

  }

  /**
   * Copy no sync files
   * 
   * @param {string} foldername
   * @param {string} originAbsolutePath
   * @returns {Promise} This Promise return boolean or string
   * @async
   * @private
   */

  async copyFiles(foldername, originAbsolutePath) {
    console.log('********* 3 ***********');
    let contentFilesforCopy = [
      'wp-content/uploads'
    ]
    await contentFilesforCopy.map((value, index, array) => {
      let comand = shell.exec(`cp -r ${originAbsolutePath}/${value} ${storesFolder}/${foldername}/${value}`)
      if (comand.code !== 0) throw comand.stderr;
    });

    return true;

  }

  /**
   * Copy and rename database
   * 
   * @param {string} dataBaseName 
   * @returns {boolean} 
   * @async
   * @private
   */


  async copyDataBase(dataBaseName) {

    console.log('********* 4 ***********');
    await mysql.configure({
      host: this.hostDB,
      user: this.userDB,
      password: this.passwordDB
    });


    await mysql.query(`create database ${dataBaseName}`)


    let comand = await shell.exec(`mysqldump -h ${this.hostDB} --user=${this.userDB} --password=${this.passwordDB} ezcommerce|mysql -h ${this.hostDB} --user=${this.userDB} --password=${this.passwordDB} ${dataBaseName}`)
    if (comand.code !== 0) throw comand.stderr;


    return true;
  }

  /**
   * Create wp config file
   * 
   * @param {string} destinyPath
   * @returns {Promise} This Promise return boolean or string
   * @async
   * @private
   */

  async createWpConfig(destinyPath, dbName) {
    console.log('********* 5 ***********');
    let salt = await this.generateSalt();
    const endfile = templates.wp_config(salt, dbName);
    try {
      fs.writeFileSync(destinyPath, endfile);
      return true;
    } catch (error) {
      throw 'error';
    }
  }


  /**
   * Generate vhost file
   * 
   * @param {string} url
   * @param {string} folder
   * @param {string} hostfolder
   * @returns {Promise} This Promise return boolean or string
   * @async
   * @private
   */

  async createVirtualHost(url, folder, hostfolder) {
    console.log('********* 7 ***********');
    const endfile = templates.nginxhost(url, folder);
    try {
     fs.writeFileSync(hostfolder, endfile);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add url site to /etc/hosts
   * 
   * @param {string} hostname 
   * @returns {boolean}
   * @async
   * @private
   */

  async addHostNameToHosts(hostname) {
    console.log('********* 6 ***********');
    let hostLine = `127.0.0.1 ${hostname}`;

    let addHostNameComand = shell.exec(`sudo echo ${hostLine} >> /etc/hosts`)
    if (addHostNameComand.code !== 0) throw addHostNameComand.stderr;


    return true;
  }


  /**
   * Generate and return Salt Key
   * 
   * @returns {string}
   * @async
   * @private
   */

  async generateSalt() {
    const url = 'https://api.wordpress.org/secret-key/1.1/salt/'
    let salt = await axios.get(url)
      .then(res => res.data)
      .catch(err => {
        throw err.response.data
      });

    return salt
  }

  /**
   * 
   * The big orchestrator
   * 
   * @param {string} folderName 
   * @param {string} urlProject 
   * @returns {void}
   * @async
   * @public
   */


  async orchestrator(folderName, urlProject) {

    let countNumberProcess = 0;

    try {

      await this.createFolder(folderName)
        .finally(countNumberProcess++);

      await this.createSymlink(folderName, origin)
        .finally(countNumberProcess++);

      await this.copyFiles(folderName, origin)
        .finally(countNumberProcess++);

      await this.copyDataBase(folderName)
        .finally(countNumberProcess++);

      await this.createWpConfig(`${storesFolder}/${folderName}/wp-config.php`, folderName)
        .finally(countNumberProcess++);

      await this.addHostNameToHosts(urlProject)
        .finally(countNumberProcess++);

      await this.createVirtualHost(urlProject, `${storesFolder}/${folderName}`, `${dotenv.VHOST_FOLDER}/${urlProject}`)
        .finally(countNumberProcess++);

      return {
        error: false,
        message: 'Sucesso'
      }

    } catch (error) {
      console.log('********* ERROR ***********');
      console.log(error)
      console.log('********* * ***********');
      let errorMessage = {
        error: true,
        message: ''
      }
      switch (countNumberProcess) {
        case 1:
        case 2:
        case 3:
        case 4:
          errorMessage.message = 'Ocorreu um erro ao criar os arquivos da loja.'
          errorMessage.error_code = countNumberProcess
          return errorMessage;
        case 5:
          errorMessage.message = 'Ocorreu um erro ao configurar seu host.'
          errorMessage.error_code = countNumberProcess
          return errorMessage;
        default:
          errorMessage.message = 'Ocorreu um erro.'
          errorMessage.error_code = countNumberProcess
          return errorMessage;
      }
    }


  }

}

module.exports = GenerateShop
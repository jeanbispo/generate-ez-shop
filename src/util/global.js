'use strict'
const dotenv = require('dotenv').config({  
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod"
}).parsed;

class General {

  constructor(){

    this.hostDB = dotenv.DB_HOST;
    this.userDB = dotenv.DB_USER;
    this.passwordDB = dotenv.DB_PASSWORD;
    this.originDBName = dotenv.DB_ORIGIN_NAME;
  }

  isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
  }

  deepCopy(original) {
    let copy = JSON.parse(JSON.parse(JSON.stringify(original)))
    return Object.assign({}, copy);
  }


  formatMoney(cash){
   return (+cash).toFixed(3).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  validateCpf(cpf) {
    let sum = 0;
    let remainder;

    cpf = cpf.replace('.', '')
      .replace('.', '')
      .replace('-', '')
      .trim();

    let allEqual = true;
    for (let i = 0; i < cpf.length - 1; i++) {
      if (cpf[i] != cpf[i + 1])
        allEqual = false;
    }
    if (allEqual)
      return false;

    for (let i = 1; i <= 9; i++)
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if ((remainder == 10) || (remainder == 11))
      remainder = 0;
    if (remainder != parseInt(cpf.substring(9, 10)))
      return false;

    sum = 0;
    for (let i = 1; i <= 10; i++)
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if ((remainder == 10) || (remainder == 11))
      remainder = 0;
    if (remainder != parseInt(cpf.substring(10, 11)))
      return false;

    return true;
  };

  slugify(string) {
    return string
    .toString()
    .toLowerCase()
    .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a')       // Special Characters #1
    .replace(/[èÈéÉêÊëË]+/g, 'e')       	// Special Characters #2
    .replace(/[ìÌíÍîÎïÏ]+/g, 'i')       	// Special Characters #3
    .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o')       	// Special Characters #4
    .replace(/[ùÙúÚûÛüÜ]+/g, 'u')       	// Special Characters #5
    .replace(/[ýÝÿŸ]+/g, 'y')       		// Special Characters #6
    .replace(/[ñÑ]+/g, 'n')       			// Special Characters #7
    .replace(/[çÇ]+/g, 'c')       			// Special Characters #8
    .replace(/[ß]+/g, 'ss')       			// Special Characters #9
    .replace(/[Ææ]+/g, 'ae')       			// Special Characters #10
    .replace(/[Øøœ]+/g, 'oe')       		// Special Characters #11
    .replace(/[%]+/g, '')       			// Special Characters #12
    .replace(/\s+/g, '')           		// Replace spaces with ''
      .replace(/[^\w\-]+/g, '')       		// Remove all non-word chars
      .replace(/\-\-+/g, '')         		// Replace multiple - with single -
      .replace(/^-+/, '')             		// Trim - from start of text
      .replace(/-+$/, '');            		// Trim - from end of text
  }
}

module.exports = General

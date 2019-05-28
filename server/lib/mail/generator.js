const fs = require('fs');
const htmlToText = require('html-to-text');
/**
 * Replace data in template
 * @param templatePath {string}
 * @param replacements {object}
 * @returns {string}
 */
exports.createHtml = (templatePath, replacements)=>{
  let html = fs.readFileSync(templatePath, 'utf8');
  Object.keys(replacements).forEach((k) => {
    html = html.replace(new RegExp(`:${k}`, 'gi'), replacements[k]);
  });
  return html;
};
/**
 * Convert to text
 * @param html {string}
 * @returns {string}
 */
exports.htmlToText = (html)=>{
  return htmlToText.fromString(html, {wordwrap: 130});
};

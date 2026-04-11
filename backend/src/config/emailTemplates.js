/**
 * src/config/emailTemplates.js
 *
 * Reusable Handlebars template renderer.
 *
 * Usage:
 *   const { renderTemplate } = require('./emailTemplates');
 *   const html = renderTemplate('applicationConfirmation', { studentName: 'Rushita', ... });
 *
 * Template files live in: src/templates/<name>.hbs
 */

const fs        = require('fs');
const path      = require('path');
const handlebars = require('handlebars');

// ── Template cache (compile once, reuse on every call) ────────────────────────
const cache = {};

const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * Compile and render a .hbs template file with the given context data.
 *
 * @param {string} templateName  – filename without extension (e.g. 'testEmail')
 * @param {object} context       – variables injected into the template
 * @returns {string}             – rendered HTML string
 */
function renderTemplate(templateName, context = {}) {
  if (!cache[templateName]) {
    const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Email template not found: ${templateName}.hbs (looked in ${TEMPLATES_DIR})`);
    }

    const source   = fs.readFileSync(filePath, 'utf8');
    cache[templateName] = handlebars.compile(source);
  }

  return cache[templateName](context);
}

/**
 * Clear the compiled template cache (useful in tests or after hot-reload).
 */
function clearCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

module.exports = { renderTemplate, clearCache };

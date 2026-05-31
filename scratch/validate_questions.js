const fs = require('fs');
const path = require('path');

// Extract validation logic from backend/server.js
const serverJsPath = path.resolve(__dirname, '../backend/server.js');
const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

// Match validateQuestion and getQuestionAnswerIndexes functions
const validateQuestionMatch = serverJsContent.match(/function validateQuestion[\s\S]*?\n\}/);
const getQuestionAnswerIndexesMatch = serverJsContent.match(/function getQuestionAnswerIndexes[\s\S]*?\n\}/);

if (!validateQuestionMatch || !getQuestionAnswerIndexesMatch) {
  console.error("Failed to extract validation functions from server.js");
  process.exit(1);
}

// Eval functions into current scope
eval(validateQuestionMatch[0]);
eval(getQuestionAnswerIndexesMatch[0]);

const dataDir = path.resolve(__dirname, '../data');

// Validate both ja and en categories
const languages = ['ja', 'en'];
let overallSuccess = true;

for (const lang of languages) {
  console.log(`\n=== Validating ${lang.toUpperCase()} Categories ===`);
  const categoriesPath = path.join(dataDir, `categories.${lang}.json`);
  if (!fs.existsSync(categoriesPath)) {
    console.error(`Category file not found: ${categoriesPath}`);
    continue;
  }

  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const validCategoryIds = new Set(categories.map(c => c.id));
  const seenFiles = new Set();
  
  let totalQuestions = 0;
  let validQuestions = 0;
  let errors = [];

  for (const cat of categories) {
    if (seenFiles.has(cat.file)) continue;
    seenFiles.add(cat.file);

    const filePath = path.join(dataDir, cat.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`File not found: ${cat.file}`);
      continue;
    }

    let fileData;
    try {
      fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      errors.push(`Invalid JSON in ${cat.file}: ${e.message}`);
      continue;
    }

    if (!Array.isArray(fileData.questions)) {
      errors.push(`${cat.file}: questions is not an array`);
      continue;
    }

    fileData.questions.forEach((q, idx) => {
      totalQuestions++;
      try {
        validateQuestion(q, idx, cat.id, validCategoryIds);
        validQuestions++;
      } catch (err) {
        errors.push(`${cat.file} (ID: ${q.id}): ${err.message}`);
      }
    });
  }

  console.log(`Validated: ${validQuestions} / ${totalQuestions}`);
  if (errors.length > 0) {
    console.error(`Found ${errors.length} validation errors:`);
    errors.forEach(e => console.error(`- ${e}`));
    overallSuccess = false;
  } else {
    console.log(`✓ All ${lang.toUpperCase()} questions successfully validated!`);
  }
}

if (!overallSuccess) {
  process.exit(1);
} else {
  console.log("\n✓ All checks passed perfectly!");
}

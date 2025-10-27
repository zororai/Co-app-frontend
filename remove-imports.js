#!/usr/bin/env node

/**
 * Script to remove import functionality from dashboard pages
 * This script removes:
 * 1. UploadIcon import
 * 2. Papa import
 * 3. handleImport function
 * 4. Import button UI
 */

const fs = require('fs');
const path = require('path');

const dashboardDir = './src/app/dashboard';

// Pages that have already been processed
const processedPages = [
  'mill/page.tsx',
  'securityonboardingstatus/page.tsx',
  'useronboard/page.tsx'
];

// Get all page.tsx files in dashboard directory
function getAllPageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllPageFiles(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Remove import functionality from a file
function removeImportFunctionality(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  let updatedContent = content;
  
  // Remove UploadIcon import
  updatedContent = updatedContent.replace(
    /import { UploadIcon } from '@phosphor-icons\/react\/dist\/ssr\/Upload';\n?/g,
    ''
  );
  
  // Remove Papa import
  updatedContent = updatedContent.replace(
    /import Papa from 'papaparse';\n?/g,
    ''
  );
  
  // Remove handleImport function (complex regex to handle multiline)
  updatedContent = updatedContent.replace(
    /function handleImport\(event: React\.ChangeEvent<HTMLInputElement>\): void \{[\s\S]*?\n  \}/g,
    ''
  );
  
  // Remove import button UI
  updatedContent = updatedContent.replace(
    /<Button[\s\S]*?startIcon={<UploadIcon[\s\S]*?<\/Button>/g,
    ''
  );
  
  // Clean up extra empty lines
  updatedContent = updatedContent.replace(/\n\n\n+/g, '\n\n');
  
  return updatedContent;
}

// Main execution
function main() {
  console.log('🗑️  Starting import removal process...\n');
  
  const allPageFiles = getAllPageFiles(dashboardDir);
  const remainingPages = allPageFiles.filter(file => {
    const relativePath = file.replace('./src/app/dashboard/', '');
    return !processedPages.includes(relativePath);
  });
  
  console.log(`Found ${remainingPages.length} pages to process:\n`);
  
  let processedCount = 0;
  let errorCount = 0;
  
  for (const filePath of remainingPages) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has import functionality
      if (originalContent.includes('handleImport') || originalContent.includes('UploadIcon')) {
        const updatedContent = removeImportFunctionality(filePath);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        const relativePath = filePath.replace('./src/app/dashboard/', '');
        console.log(`✅ ${relativePath}`);
        processedCount++;
      } else {
        const relativePath = filePath.replace('./src/app/dashboard/', '');
        console.log(`⏭️  ${relativePath} (no import functionality found)`);
      }
    } catch (error) {
      const relativePath = filePath.replace('./src/app/dashboard/', '');
      console.log(`❌ ${relativePath} - Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Processed: ${processedCount} pages`);
  console.log(`   ❌ Errors: ${errorCount} pages`);
  console.log(`   📁 Total pages: ${allPageFiles.length} pages`);
  console.log(`\n🎉 Import removal process completed!`);
}

// Run the script
main();

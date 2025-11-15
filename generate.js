const fs = require('fs');
const path = require('path');

const greetings = [
  'Hello',
  'Hi',
  'Hey',
  'Greetings',
  'Salutations',
  'Good morning',
  'Good afternoon',
  'Good evening',
  'Howdy',
  'Yo',
  'Hi there',
  'Hello world',
  'Hey buddy',
  'Greetings friend'
];

const numLines = 40000;
const outputPath = path.join(__dirname, 'hello.txt');
const metadataPath = path.join(__dirname, 'metadata.txt');

let content = '';
let greetingCounts = {};

for (let i = 0; i < numLines; i++) {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  content += greeting + '\n';
  greetingCounts[greeting] = (greetingCounts[greeting] || 0) + 1;
}

fs.writeFileSync(outputPath, content);

const stats = fs.statSync(outputPath);
const metadata = `File: hello.txt
Lines: ${numLines}
Size: ${stats.size} bytes
Greeting counts:
${Object.entries(greetingCounts).map(([g, c]) => `${g}: ${c}`).join('\n')}
`;

fs.writeFileSync(metadataPath, metadata);

console.log('Generated hello.txt and metadata.txt');
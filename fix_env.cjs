const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');

const keyMatch = content.match(/GEMINI_API_KEY=([^\s=]+)/);
const key = keyMatch ? keyMatch[1] : '';

const uri = 'mongodb+srv://sakthibharath1234:9442911534@cluster0.xawfdkm.mongodb.net/preaptiai?retryWrites=true&w=majority';
const port = '5000';

const newContent = `GEMINI_API_KEY=${key}\nMONGODB_URI=${uri}\nPORT=${port}\n`;
fs.writeFileSync('.env.local', newContent);
console.log('Fixed .env.local with placeholder URI');

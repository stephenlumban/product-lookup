import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const v1Path = path.join(__dirname, 'src', 'savealot_combined.json');
const v2Path = path.join(__dirname, 'src', 'savealot_base.json');
const outputPath = path.join(__dirname, 'src', 'savealot_merged_all.json');

console.log('Reading files...');
const v1 = JSON.parse(fs.readFileSync(v1Path, 'utf8'));
const v2 = JSON.parse(fs.readFileSync(v2Path, 'utf8'));

console.log(`V1 size: ${v1.length}`);
console.log(`V2 size: ${v2.length}`);

const seen = new Set();
const merged = [];
let duplicates = 0;

const processItem = (item) => {
    // Exact replica check: same name AND same image URL
    const key = `${item.productName}|${item.productImageUrl}`;
    if (seen.has(key)) {
        duplicates++;
    } else {
        seen.add(key);
        merged.push(item);
    }
};

// Process v2 first (since it's the "base" and larger 16k one, maybe we want to prioritize it? 
// Or v1? User said "combine both... if they have extra". Order doesn't matter for "exact replica" logic 
// other than which specific object instance is kept, but they are identical.)
// Let's do v1 then v2.
v1.forEach(processItem);
v2.forEach(processItem);

console.log(`Merged size: ${merged.length}`);
console.log(`Duplicates removed: ${duplicates}`);

fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
console.log(`Written to ${outputPath}`);

import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/loader.json', 'utf8'));

// orange-600 = #ea580c => [0.918, 0.345, 0.047, 1]
const orange = [0.918, 0.345, 0.047, 1];

function processItems(items) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    // Fill: set opacity to 0
    if (item.ty === 'fl') {
      if (item.o && item.o.k !== undefined) {
        item.o.k = 0;
      }
    }
    // Stroke: change color to orange
    if (item.ty === 'st') {
      if (item.c && item.c.k) {
        item.c.k = orange;
      }
    }
    // Recurse into groups
    if (item.ty === 'gr' && item.it) {
      processItems(item.it);
    }
  }
}

// Process all top-level layers
for (const layer of data.layers || []) {
  if (layer.shapes) {
    processItems(layer.shapes);
  }
}

// Process asset layers
for (const asset of data.assets || []) {
  for (const layer of asset.layers || []) {
    if (layer.shapes) {
      processItems(layer.shapes);
    }
  }
}

fs.writeFileSync('public/loader.json', JSON.stringify(data));
console.log('Done — fills removed, strokes set to orange-600');

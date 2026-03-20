const fs = require('fs');
const buf = fs.readFileSync('public/model.glb');
const jsonLength = buf.readUInt32LE(12);
const json = buf.toString('utf8', 20, 20 + jsonLength);
const data = JSON.parse(json);

console.log('--- MESHES ---');
data.meshes.forEach(m => console.log(m.name));

console.log('--- NODES WITH MESHES ---');
data.nodes.forEach(n => {
  if (n.mesh !== undefined) {
    console.log(`Node: ${n.name}, Mesh Index: ${n.mesh}, Mesh Name: ${data.meshes[n.mesh].name}`);
  }
});

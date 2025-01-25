const fs = require('fs');
const { execSync } = require('child_process');

// Get local IP address
const getLocalIP = () => {
  const ip = execSync(
    "ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1",
    { encoding: 'utf8' }
  ).trim();
  return ip || 'localhost';
};

// Update test.sh file
const updateTestFile = (ip) => {
  const testFile = 'test.sh';
  const content = fs.readFileSync(testFile, 'utf8');
  const updatedContent = content.replace(
    /^(export CYPRESS_BASE_URL=http:\/\/)([^:]+)(:\d+\/)$/m,
    `$1${ip}$3`
  ).replace(
    /^(export CYPRESS_BACKEND=http:\/\/)([^:]+)(:\d+\/)$/m,
    `$1${ip}$3`
  );
  fs.writeFileSync(testFile, updatedContent, 'utf8');
};

const localIP = getLocalIP();
updateTestFile(localIP);

console.log(`Updated CYPRESS_BASE_URL and CYPRESS_BACKEND to http://${localIP}:8080/ and http://${localIP}:3001/ in test.sh`);

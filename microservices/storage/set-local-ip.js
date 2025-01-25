const fs = require('fs')
const { execSync } = require('child_process')

// Get local IP address
const getLocalIP = () => {
    const ip = execSync(
        "ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1",
        { encoding: 'utf8' }
    ).trim()
    return ip || 'localhost'
}

// Update .env file
const updateEnvFile = (ip) => {
    const envFile = '.env'
    const content = fs.readFileSync(envFile, 'utf8')
    const updatedContent = content.replace(
        /^(WEBAPP_URL=http:\/\/)([^:]+)(:\d+)$/m,
        `$1${ip}$3`
    )
    fs.writeFileSync(envFile, updatedContent, 'utf8')
}

const localIP = getLocalIP()
updateEnvFile(localIP)

console.log(`Updated REACT_APP_API_ENDPOINT to http://${localIP}:8080 in .env`)

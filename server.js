const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Generate self-signed certificate
const forge = require('node-forge');
const pki = forge.pki;

// Create a new keypair
const keys = pki.rsa.generateKeyPair(2048);

// Create a certificate
const cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',
  value: 'Blacksburg'
}, {
  name: 'organizationName',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

// Convert to PEM format
const pemCert = pki.certificateToPem(cert);
const pemKey = pki.privateKeyToPem(keys.privateKey);

// HTTPS server options
const options = {
  key: pemKey,
  cert: pemCert
};

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mind': 'application/octet-stream'
};

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './immersive' || filePath === './immersive/') {
    filePath = './immersive.html';
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Read and serve file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 8443;
const HOST = '0.0.0.0';

// Function to get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal, non-IPv4, and VPN-like interfaces (subnet mask 255.255.255.255)
      if (iface.family === 'IPv4' && !iface.internal && iface.netmask !== '255.255.255.255') {
        return iface.address;
      }
    }
  }
  return '192.168.1.50'; // Fallback to local network IP
}

// Function to launch URL via ADB
function launchADB(url) {
  console.log('\n🔌 Attempting to launch on Android device via ADB...');
  
  // Check if device is connected
  exec('adb devices', (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  ADB not found or not in PATH');
      console.log('   Install Android SDK Platform Tools or Android Studio');
      return;
    }
    
    const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
    if (lines.length === 0) {
      console.log('⚠️  No Android devices connected via ADB');
      console.log('\n📱 To enable Chrome Remote Debugging:');
      console.log('   1. Enable Developer Options on your phone');
      console.log('   2. Enable USB Debugging in Developer Options');
      console.log('   3. Connect phone via USB cable');
      console.log('   4. Run: adb devices (should show your device)');
      console.log('   5. Open chrome://inspect in PC Chrome');
      return;
    }
    
    console.log(`✅ Found ${lines.length} connected device(s)`);
    
    // Setup port forwarding for remote debugging
    exec('adb reverse tcp:8443 tcp:8443', (error, stdout, stderr) => {
      if (!error) {
        console.log('✅ Port forwarding enabled (localhost:8443 on device → PC)');
        console.log('   On your phone, go to: https://localhost:8443');
      }
    });
    
    // Launch URL in Chrome on the device
    const adbCommand = `adb shell am start -a android.intent.action.VIEW -d "${url}"`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Failed to launch URL on device:', error.message);
      } else {
        console.log('✅ URL launched on Android device!');
      }
    });
  });
}

// Function to setup Chrome remote debugging
function setupRemoteDebugging() {
  console.log('\n🔧 Setting up Chrome Remote Debugging...');
  
  exec('adb devices', (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  ADB not available');
      return;
    }
    
    const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('List of devices') && line.includes('device'));
    if (lines.length === 0) {
      return;
    }
    
    // Enable Chrome debugging on device
    exec('adb shell am start -a com.android.chrome/com.google.android.apps.chrome.Main --ez enable-remote-debugging true', (err) => {
      // This may not work on all devices, that's okay
    });
    
    // Forward Chrome DevTools port
    exec('adb forward tcp:9222 localabstract:chrome_devtools_remote', (error, stdout, stderr) => {
      if (!error) {
        console.log('✅ Chrome DevTools forwarding enabled');
        console.log('   Open chrome://inspect in your PC browser');
        console.log('   Your device should appear under "Remote Target"');
      }
    });
  });
}

server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const url = `https://${localIP}:${PORT}`;
  
  console.log('\n==============================================');
  console.log('🚀 HTTPS Server Running!');
  console.log('==============================================');
  console.log(`Local:   https://localhost:${PORT}`);
  console.log(`Network: ${url}`);
  console.log('==============================================');
  console.log('\n⚠️  IMPORTANT: You will see a security warning');
  console.log('   Click "Advanced" → "Proceed to site"');
  console.log('   This is safe - it\'s your local server\n');
  console.log('📱 On your tablet, go to:');
  console.log(`   ${url}\n`);
  console.log('🔍 Chrome Remote Debug: chrome://inspect');
  console.log('Press Ctrl+C to stop the server\n');
  
  // Launch on Android device via ADB
  launchADB(url);
  
  // Setup remote debugging
  setupRemoteDebugging();
});

const http = require('http')
const fs = require('fs')
const path = require('path')
const DIST = path.resolve(__dirname, 'dist')
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' }
http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url
  let filePath = path.join(DIST, url)
  if (!fs.existsSync(filePath)) filePath = path.join(DIST, 'index.html')
  const ext = path.extname(filePath)
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' })
    res.end(data)
  })
}).listen(3000, '0.0.0.0', () => console.log('Frontend su porta 3000'))

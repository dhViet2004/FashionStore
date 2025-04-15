const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();

// Cấu hình phục vụ file tĩnh từ thư mục public của Lab05
server.use(jsonServer.defaults({
  static: path.join(__dirname, '../JsonServer/public') // Đường dẫn tương đối
}));


server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

server.use(jsonServer.router('db.json'));

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../JsonServer')}`);
});
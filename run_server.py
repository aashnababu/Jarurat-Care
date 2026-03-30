import http.server
import socketserver
import mimetypes

PORT = 3000

# Fix the broken JS registry keys on Windows
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

Handler = CustomHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Serving at port", PORT)
        httpd.serve_forever()
except OSError:
    print("Port is already in use, trying restarting...")

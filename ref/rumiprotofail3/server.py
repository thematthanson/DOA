from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CachingHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Set cache headers based on file type
        path = self.translate_path(self.path)
        ext = os.path.splitext(path)[1]
        
        # Cache static assets for 1 hour
        if ext in ['.js', '.css', '.svg']:
            self.send_header('Cache-Control', 'public, max-age=3600')
        else:
            # No cache for HTML files
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, CachingHTTPRequestHandler)
    print('Serving HTTP on port 8000...')
    httpd.serve_forever() 
import re as _re
from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import FileResponse, HttpResponse, Http404

_CONTENT_TYPES = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.ogv': 'video/ogg',
    '.mov': 'video/quicktime',
}


def _stream_file(f, length, chunk=65536):
    remaining = length
    try:
        while remaining > 0:
            data = f.read(min(chunk, remaining))
            if not data:
                break
            remaining -= len(data)
            yield data
    finally:
        f.close()


def serve_media(request, path):
    """Serve media files with proper HTTP 206 Range support so video seeking works."""
    full_path = (Path(settings.MEDIA_ROOT) / path).resolve()
    media_root = Path(settings.MEDIA_ROOT).resolve()
    if not str(full_path).startswith(str(media_root)) or not full_path.is_file():
        raise Http404()

    file_size = full_path.stat().st_size
    content_type = _CONTENT_TYPES.get(full_path.suffix.lower(), 'application/octet-stream')
    range_header = request.META.get('HTTP_RANGE', '').strip()

    if range_header:
        m = _re.match(r'bytes=(\d+)-(\d*)', range_header)
        if m:
            first = int(m.group(1))
            last = int(m.group(2)) if m.group(2) else file_size - 1
            last = min(last, file_size - 1)
            length = last - first + 1

            f = open(full_path, 'rb')
            f.seek(first)
            response = HttpResponse(
                _stream_file(f, length),
                status=206,
                content_type=content_type,
            )
            response['Content-Range'] = f'bytes {first}-{last}/{file_size}'
            response['Content-Length'] = length
            response['Accept-Ranges'] = 'bytes'
            return response

    # Full file (no Range header)
    response = FileResponse(open(full_path, 'rb'), content_type=content_type)
    response['Content-Length'] = file_size
    response['Accept-Ranges'] = 'bytes'
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('quizzes.urls')),
    path('api/', include('progress.urls')),
    re_path(r'^media/(?P<path>.+)$', serve_media),
]

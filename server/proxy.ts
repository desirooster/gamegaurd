import { storage } from "./storage";

interface ProxyResult {
  content: string;
  url: string;
  title: string;
  responseTime: number;
  status: number;
  error?: string;
}

const proxyScript = `
<script>
(function() {
  // Intercept all link clicks
  document.addEventListener('click', function(e) {
    let target = e.target;
    
    // Find the closest anchor tag
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.href) {
      e.preventDefault();
      e.stopPropagation();
      
      // Send message to parent to navigate through proxy
      window.parent.postMessage({
        type: 'proxy-navigate',
        url: target.href
      }, '*');
    }
  }, true);
  
  // Intercept form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.method.toUpperCase() === 'GET' && form.action) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const params = new URLSearchParams(formData);
      const url = form.action + '?' + params.toString();
      
      window.parent.postMessage({
        type: 'proxy-navigate',
        url: url
      }, '*');
    }
  }, true);
  
  // Handle window.open
  const originalOpen = window.open;
  window.open = function(url) {
    if (url) {
      window.parent.postMessage({
        type: 'proxy-navigate',
        url: new URL(url, window.location.href).href
      }, '*');
    }
    return null;
  };
  
  // Handle location changes
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    window.parent.postMessage({
      type: 'proxy-navigate',
      url: window.location.href
    }, '*');
  };
})();
</script>
`;

export async function fetchProxiedContent(url: string): Promise<ProxyResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": url,
      },
      redirect: "follow",
    });

    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const error = `HTTP ${response.status}: ${response.statusText}`;
      await storage.createProxyLog({
        url,
        status: response.status,
        responseTime,
        error,
      });

      return {
        content: "",
        url,
        title: "Error",
        responseTime,
        status: response.status,
        error,
      };
    }

    if (!contentType.includes("text/html")) {
      const error = "This URL does not return HTML content";
      await storage.createProxyLog({
        url,
        status: 415,
        responseTime,
        error,
      });

      return {
        content: "",
        url,
        title: "Error",
        responseTime,
        status: 415,
        error,
      };
    }

    let html = await response.text();
    const baseUrl = new URL(url);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : baseUrl.hostname;

    // Add base tag for relative URLs
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${baseUrl.origin}/" target="_self">`
    );

    // Rewrite relative URLs to absolute
    html = html.replace(
      /(<link[^>]*href=["'])(?!http|\/\/|data:|javascript:|#)/gi,
      `$1${baseUrl.origin}/`
    );

    html = html.replace(
      /(<script[^>]*src=["'])(?!http|\/\/|data:|javascript:)/gi,
      `$1${baseUrl.origin}/`
    );

    html = html.replace(
      /(<img[^>]*src=["'])(?!http|\/\/|data:|javascript:)/gi,
      `$1${baseUrl.origin}/`
    );

    html = html.replace(
      /(<a[^>]*href=["'])(?!http|\/\/|data:|javascript:|#|mailto:)/gi,
      `$1${baseUrl.origin}/`
    );

    // Inject our navigation script before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${proxyScript}</body>`);
    } else {
      html += proxyScript;
    }

    await storage.createProxyLog({
      url,
      status: response.status,
      responseTime,
    });

    await storage.createBrowsingHistory({
      url,
      title,
    });

    return {
      content: html,
      url,
      title,
      responseTime,
      status: response.status,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await storage.createProxyLog({
      url,
      status: 500,
      responseTime,
      error: errorMessage,
    });

    return {
      content: "",
      url,
      title: "Error",
      responseTime,
      status: 500,
      error: `Failed to fetch: ${errorMessage}`,
    };
  }
}

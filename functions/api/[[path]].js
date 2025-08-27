// API代理函数 - 将/api/*请求转发到Workers API
export async function onRequest(context) {
  const { request, env } = context;
  
  // 获取原始请求路径
  const url = new URL(request.url);
  const apiPath = url.pathname;
  
  // Workers API的实际地址（这是部署在Workers上的API服务）
  // 这个必须指向实际的Workers服务，不能指向自己的域名（会造成循环）
  const targetUrl = `https://zhiji-api.wutongci.workers.dev${apiPath}${url.search}`;
  
  // 创建新的请求，保留原始请求的方法和头部
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    // 保留原始请求的其他属性
    duplex: 'half'
  });
  
  try {
    // 转发请求到Workers API
    const response = await fetch(newRequest);
    
    // 返回响应，保留所有头部
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'API proxy failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
// 用户列表接口（演示用，实际应对接数据库）
// 部署为 Netlify Function，路径: /api/users

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 演示模式返回空列表，飞书登录后前端会自动补充
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, users: [] })
  };
};
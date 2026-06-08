// 飞书 OAuth 登录 + 用户信息接口
// 部署为 Netlify Function，路径: /api/login

const FS_APP_ID = 'cli_aaabfe578c799ccb';
const FS_APP_SECRET = process.env.FS_APP_SECRET || '';

// 预设角色映射（open_id -> 角色配置）
const ROLE_MAP = {
  // 可在此处预配置特定用户的角色，格式:
  // 'ou_xxxx': { role_code: 'admin', role_name: '系统管理员', permissions: ['all'] }
};

// 默认角色
const DEFAULT_ROLE = { role_code: 'member', role_name: '普通成员', permissions: ['apply'] };

// 管理员 open_id 列表
const ADMIN_OPEN_IDS = process.env.ADMIN_OPEN_IDS ? process.env.ADMIN_OPEN_IDS.split(',') : [];

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理 CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const code = params.code;

  if (!code) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: '缺少授权码 code' }) };
  }

  if (!FS_APP_SECRET) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: '未配置飞书 App Secret，请在 Netlify 环境变量中设置 FS_APP_SECRET' }) };
  }

  try {
    // Step 1: 用 code 换取 app_access_token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FS_APP_ID, app_secret: FS_APP_SECRET })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.code !== 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: '获取 app_access_token 失败: ' + (tokenData.msg || '未知错误') })
      };
    }

    const appAccessToken = tokenData.app_access_token;

    // Step 2: 用 code + app_access_token 换取 user_access_token
    const userTokenRes = await fetch('https://open.feishu.cn/open-apis/authen/v1/oidc/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + appAccessToken
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code
      })
    });

    const userTokenData = await userTokenRes.json();
    if (userTokenData.code !== 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: '获取 user_access_token 失败: ' + (userTokenData.msg || '未知错误') })
      };
    }

    const userAccessToken = userTokenData.data.access_token;
    const openId = userTokenData.data.open_id;

    // Step 3: 用 user_access_token 获取用户信息
    const userInfoRes = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + userAccessToken }
    });

    const userInfoData = await userInfoRes.json();
    if (userInfoData.code !== 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: '获取用户信息失败: ' + (userInfoData.msg || '未知错误') })
      };
    }

    const userInfo = userInfoData.data;

    // Step 4: 尝试获取更详细的部门信息（需要 contact:user.base:readonly 权限）
    let deptName = userInfo.department_id || '';
    if (deptName && appAccessToken) {
      try {
        const deptRes = await fetch('https://open.feishu.cn/open-apis/contact/v3/departments/' + deptName + '?department_id_type=open_department_id', {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + appAccessToken }
        });
        const deptData = await deptRes.json();
        if (deptData.code === 0 && deptData.data && deptData.data.department) {
          deptName = deptData.data.department.name;
        }
      } catch (e) {
        // 部门信息获取失败不影响登录
      }
    }

    // Step 5: 确定用户角色
    let role = ROLE_MAP[openId] || DEFAULT_ROLE;
    let isAdmin = ADMIN_OPEN_IDS.includes(openId) || role.role_code === 'admin';
    if (isAdmin && role.role_code !== 'admin') {
      role = { role_code: 'admin', role_name: '系统管理员', permissions: ['all'] };
    }

    // 构造返回数据
    const result = {
      success: true,
      user: {
        open_id: openId,
        name: userInfo.name || '未知用户',
        dept_name: deptName || '未指定部门',
        avatar_url: userInfo.avatar_url || userInfo.picture || '',
        mobile: userInfo.mobile || '',
        role_code: role.role_code,
        role_name: role.role_name,
        permissions: role.permissions,
        is_admin: isAdmin
      }
    };

    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: '服务器内部错误: ' + err.message })
    };
  }
};
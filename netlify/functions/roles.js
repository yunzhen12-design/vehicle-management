// 角色列表接口
// 部署为 Netlify Function，路径: /api/roles

const DEMO_ROLES = [
  { id: 'R001', name: '系统管理员', code: 'admin', desc: '拥有全部权限', permissions: ['all'] },
  { id: 'R002', name: '部门负责人', code: 'dept_head', desc: '审批本部门用车申请', permissions: ['approve_dept'] },
  { id: 'R003', name: '行政部审批人', code: 'admin_approver', desc: '行政部审批+派车', permissions: ['approve_admin', 'dispatch'] },
  { id: 'R004', name: '普通成员', code: 'member', desc: '提交用车申请', permissions: ['apply'] },
  { id: 'R005', name: '驾驶员', code: 'driver', desc: '查看派车任务', permissions: ['view_dispatch'] }
];

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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, roles: DEMO_ROLES })
  };
};
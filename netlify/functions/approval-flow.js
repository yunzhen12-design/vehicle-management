// 审批流程配置接口
// 部署为 Netlify Function，路径: /api/approval-flow

const DEMO_FLOW = [
  { step: 1, name: '部门负责人审批', role_code: 'dept_head', desc: '部门负责人审核本部门用车申请' },
  { step: 2, name: '行政部审批', role_code: 'admin_approver', desc: '行政部终审并安排派车' }
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
    body: JSON.stringify({ success: true, flow: DEMO_FLOW })
  };
};
import request from '@/utils/request';

// 查询所有表名
export async function listTable() {
  return request.get(`/server/api/v1/tool/generate/tables`);
}


// 查询表下的所有字段信息
export async function listFieldByTableName(tableName: any) {
    return request.get(`/server/api/v1/tool/generate/table/${ tableName }/fields`);
}

// 查询表的所有生成配置
export async function listSettingByTableName(tableName: any) {
    return request.get(`/server/api/v1/tool/generate/table/${ tableName }/settings`);
}

// 保存表的生成配置
export async function insertSettingForTable(param: any) {
    return request.post('/server/api/v1/tool/generate/settings/', {
        data: param,
        getResponse: true
    });
}

// 更新字段的信息
export async function updateField(param: any) {
  return request.put('/server/api/v1/tool/generate/fields/', {
    data: param,
    getResponse: true
  });
}

// 生成代码
export async function generateCode(param: any) {
    return request.post('/server/api/v1/tool/generate/code/', {
        data: param,
        getResponse: true
    });
}




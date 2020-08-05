import request from '@/utils/request';

// 查询所有文件类型
export async function listAll() {
    return request.get(`/server/api/v1/tool/fileClassifications`);
}

// 分页查询文件类型
export async function listForPage(param: any) {
  return request.get('/server/api/v1/tool/fileClassifications/paging', {
    params: param
  });
}

// 新增文件类型
export async function insert(param: any) {
    return request.post('/server/api/v1/tool/fileClassifications', {
      params: param,
      getResponse: true
    });
}

// 编辑文件类型
export async function update(param: any) {
    return request.put('/server/api/v1/tool/fileClassifications', {
        data: param,
      getResponse: true
    });
}

// 删除文件类型
export async function remove(id: any) {
    return request.delete(`/server/api/v1/tool/fileClassifications/${id}`, {
        getResponse: true
    });
}




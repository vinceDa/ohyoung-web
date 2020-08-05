import request from '@/utils/request';

// 查询所有文件
export async function listAll(classificationId: any) {
    return request.get(`/server/api/v1/tool/fileStorage?classificationId=${classificationId}`);
}

// 分页查询文件
export async function listForPage(param: any) {
  return request.get('/server/api/v1/tool/fileStorage/paging', {
    params: param
  });
}

// 新增文件
export async function insert() {
    return request.post('/server/api/v1/tool/fileStorage', {
        getResponse: true
    });
}

// 编辑文件
export async function update(param: any) {
    return request.put('/server/api/v1/tool/fileStorage', {
        data: param,
        getResponse: true
    });
}

// 删除文件
export async function remove(id: any) {
    return request.delete(`/server/api/v1/tool/fileStorage/${id}`, {
        getResponse: true
    });
}

// 下载文件
export async function download(id: any) {
  return request.get(`/server/api/v1/tool/fileStorage/download/${id}`);
}



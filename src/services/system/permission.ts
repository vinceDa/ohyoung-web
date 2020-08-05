import request from '@/utils/request';

// 查询所有权限
export async function listAll(param: any) {
    return request.get('/server/api/v1/system/permissions', {
        params: param
    });
}

// 新增权限
export async function insert(param: any) {
    return request.post('/server/api/v1/system/permissions', {
        data: param,
        getResponse: true
    });
}

// 编辑权限
export async function update(param: any) {
    return request.put('/server/api/v1/system/permissions', {
        data: param,
        getResponse: true
    });
}

// 删除权限
export async function remove(id: any) {
    return request.delete('/server/api/v1/system/permissions/' + id, {
        getResponse: true
    });
}
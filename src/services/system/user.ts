import request from '@/utils/request';

// 分页查询用户
export async function listPageable(param: any) {
    return request.get('/server/api/v1/system/users/paging', {
        params: param
    });
}

// 新增用户
export async function insert(param: any) {
    return request.post('/server/api/v1/system/users', {
        data: param,
        getResponse: true
    });
}

// 编辑用户
export async function update(param: any) {
    return request.put('/server/api/v1/system/users', {
        data: param,
        getResponse: true
    });
}

// 删除用户
export async function remove(id: any) {
    return request.delete(  `/server/api/v1/system/users//${id}`, {
        getResponse: true
    });
}

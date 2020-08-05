import request from '@/utils/request';

// 查询所有岗位
export async function listAll(param: any) {
    return request.get('/server/api/v1/system/jobs', {
        params: param
    });
}

// 分页查询岗位
export async function listPageable(param: any) {
    return request.get('/server/api/v1/system/jobs/paging', {
        params: param
    });
}

// 新增岗位
export async function insert(param: any) {
    return request.post('/server/api/v1/system/jobs', {
        data: param,
        getResponse: true
    });
}

// 编辑岗位
export async function update(param: any) {
    return request.put('/server/api/v1/system/jobs', {
        data: param,
        getResponse: true
    });
}

// 删除岗位
export async function remove(id: any) {
    return request.delete('/server/api/v1/system/jobs/' + id, {
        getResponse: true
    });
}
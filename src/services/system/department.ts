import request from '@/utils/request';

// 查询所有部门
export async function listAll(param: any) {
    return request.get('/server/api/v1/system/departments', {
        params: param
    });
}

// 新增部门
export async function insert(param: any) {
    return request.post('/server/api/v1/system/departments', {
        data: param,
        getResponse: true
    });
}

// 编辑部门
export async function update(param: any) {
    return request.put('/server/api/v1/system/departments', {
        data: param,
        getResponse: true
    });
}

// 删除部门
export async function remove(id: any) {
    return request.delete('/server/api/v1/system/departments/' + id, {
        getResponse: true
    });
}

// 查询部门下的所有岗位
export async function listJobs(id: any) {
    return request.get('/server/api/v1/system/departments/' + id + "/jobs");
}
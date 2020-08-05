import request from '@/utils/request';


// 查询所有定时任务
export async function listPageable() {
    return request.get('/server/api/v1/tool/quartz/tasks');
}

// 新增定时任务
export async function insert(param: any) {
    return request.post('/server/api/v1/tool/quartz/tasks', {
        data: param,
        getResponse: true
    });
}

// 编辑定时任务
export async function update(param: any) {
    return request.put('/server/api/v1/tool/quartz/tasks', {
        data: param,
        getResponse: true
    });
}

// 删除定时任务
export async function remove(id: any) {
    return request.delete(`/server/api/v1/util/quartz/tasks/${id}`, {
        getResponse: true
    });
}

// 启动定时任务
export async function start(id: any) {
    return request.post(`/server/api/v1/util/quartz/tasks/start/${id}`, {
        getResponse: true
    });
}

// 暂停定时任务
export async function pause(id: any) {
    return request.post(`/server/api/v1/util/quartz/tasks/pause/${id}`, {
        getResponse: true
    });
}

// 恢复定时任务
export async function resume(id: any) {
    return request.post(`/server/api/v1/util/quartz/tasks/resume/${id}`, {
        getResponse: true
    });
}

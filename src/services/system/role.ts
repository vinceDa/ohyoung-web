import request from '@/utils/request';

// 查询所有角色
export async function listAll() {
    return request.get('/server/api/v1/system/roles/all');
}

// 分页查询角色
export async function listForPage(param: any) {
    return request.get('/server/api/v1/system/roles/paging', {
        params: param
    });
}

// 新增角色
export async function insert(param: any) {
    return request.post('/server/api/v1/system/roles', {
        data: param,
        getResponse: true
    });
}

// 编辑角色
export async function update(param: any) {
    return request.put('/server/api/v1/system/roles', {
        data: param,
        getResponse: true
    });
}

// 删除角色
export async function remove(id: any) {
    return request.delete(`/server/api/v1/system/roles/${id}`, {
        getResponse: true
    });
}

// 更新角色的菜单
export async function updateRoleMenus(param: any) {
    return request.put('/server/api/v1/system/roles/menus', {
        data: param,
        getResponse: true
    });
}

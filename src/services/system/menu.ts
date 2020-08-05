import request from '@/utils/request';

// 查询所有菜单
export async function listAll(param: any) {
    return request.get('/server/api/v1/system/menus', {
        params: param
    });
}

// 新增菜单
export async function insert(param: any) {
    return request.post('/server/api/v1/system/menus', {
        data: param,
        getResponse: true
    });
}

// 编辑菜单
export async function update(param: any) {
    return request.put('/server/api/v1/system/menus', {
        data: param,
        getResponse: true
    });
}

// 删除菜单
export async function remove(id: any) {
    return request.delete(`/server/api/v1/system/menus/${id}`, {
        getResponse: true
    });
}

// 生成菜单树
export async function buildMenuTree() {
  return request.get(`/server/api/v1/system/menus/tree`, {
    getResponse: true
  });
}

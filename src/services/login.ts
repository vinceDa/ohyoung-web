import request from '@/utils/request';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
}

// 用户登录
export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/server/api/v1/auth/login', {
    method: 'POST',
    data: params,
    getResponse: true
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            // 菜单
            {
              path: '/system',
              name: '系统管理',
              icon: 'smile',
              routes: [
                {
                  path: '/system/user',
                  name: '用户管理',
                  component: 'system/user',
                },
                {
                  path: '/system/role/',
                  name: '角色管理',
                  component: 'system/role/index',
                },
                {
                  path: 'menu/',
                  name: '菜单管理',
                  component: 'system/menu/',
                },
                {
                  path: 'department/',
                  name: '部门管理',
                  component: 'system/department/',
                },
                {
                  path: 'job/',
                  name: '岗位管理',
                  component: 'system/job/',
                },
              ],
            },
            {
              name: '系统工具',
              icon: 'smile',
              path: 'tool',
              routes: [
                {
                  path: 'generate/',
                  name: '代码生成',
                  component: 'tool/generate/',
                },
                {
                  path: 'quartz/',
                  name: '定时任务',
                  component: 'tool/quartz/',
                },
                {
                  path: 'storage/',
                  name: '文件管理',
                  component: 'tool/fileStorage/',
                },
                {
                  path: 'classification/',
                  name: '文件类型管理',
                  component: 'tool/fileClassification/',
                },
              ],
            },
            {
              path: '/',
              redirect: '/home',
            },
            {
              path: '/welcome',
              name: 'welcome',
              icon: 'smile',
              component: './Welcome',
            },
            {
              path: '/admin',
              name: 'admin',
              icon: 'crown',
              component: './Admin',
              authority: ['admin'],
              routes: [
                {
                  path: '/admin/sub-page',
                  name: 'sub-page',
                  icon: 'smile',
                  component: './Welcome',
                  authority: ['admin'],
                },
              ],
            },
            {
              name: 'list.table-list',
              icon: 'table',
              path: '/list',
              component: './ListTableList',
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});

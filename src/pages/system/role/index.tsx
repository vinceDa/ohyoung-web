import React from 'react';

import { Row, Col, Input, Button, Table, Modal, Form, Spin, message, Popconfirm, Tree, Empty } from 'antd';

import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import { insert, listForPage, update, remove, updateRoleMenus } from '@/services/system/role';

import { listAll as listAllMenu } from '@/services/system/menu';

import { handleOriginDataToTreeData } from '@/pages/system/role/utils/util';
import { listJobs } from '@/services/system/department';

interface FormField {
  id: number;
  username: string;
  phone: string;
  email: string;
  departmentId: number;
  jobId: number;
  roleIds: number[];
  enable: boolean;
}

interface RequestParam {
  page: number;
  size: number;
  blurry: string;
}


interface CollectionCreateFormProps {
  title: string
  visible: boolean;
  formRef: any;
  onCreate: (values: FormField) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<CollectionCreateFormProps> = ({
  title,
  visible,
  formRef,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: {
      xs: { span: 16 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  return (
    <Modal
        forceRender
        title={title}
        visible={visible}
        onOk={() => {
          form
            .validateFields()
            .then((values: any) => {
              onCreate(values);
              form.resetFields();
            })
        }}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
      >
          <Form {...formItemLayout} form={form} ref={formRef} >
            <Form.Item name="id">
                <Input style={{ display: 'none' }} />
            </Form.Item>
            <Form.Item label="名称" name="name" rules={ [{ required: true, message: '角色名称不能为空!' }] }>
                <Input placeholder="请输入用户名称" />
            </Form.Item>
            <Form.Item label="描述" name="description">
                <Input placeholder="请输入角色描述"/>
            </Form.Item>
            </Form>
        </Modal>
  );
};

class RolePage extends React.Component {
  state = {
    title: '',
    isSpinning: false,
    tableData: [],
    // 控制菜单树的选中项
    checkedKeys: [],
    page: 0,
    pageSize: 10,
    // 传到后台的包含父节点的菜单数组
    checkedKeysResult: [],
    // 当前被选中的角色
    selectedRowKeys: [],
    // 搜索框的值
    searchValue: '',
    menuTreeData: [],
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listRolePageable();
    this.listAllMenu();
  }

  getRequestParam() {
    const param: RequestParam = { 'page': 0, "size": 10, "blurry": '' };
    const blurry = this.state.searchValue;
    param.page = this.state.page;
    param.size = this.state.pageSize;
    if (blurry != null && blurry !== '' && blurry !== 'undefined') {
      param.blurry = blurry;
    }  else {
      delete param.blurry;
    }
    console.log("param: ", param);
    return param;
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  // 搜索
  search = () => {
    this.listRolePageable();
  }

  // 点击新增按钮
  enableModal = () => {
    this.setState({ visible: true, title: '新增角色' });
  }

  // 点击编辑按钮
  editRole = (record: { departmentId? : any; }) => {
    this.setState({ visible: true, title: '编辑角色' });
    const $ = this;
    const { form } = this.formRef.props;
    if (record.departmentId != null) {
      listJobs(record.departmentId)
        .then(res => {
          $.setState({ jobData: res });
        })
    }
    form.setFieldsValue(record);

  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    const valuesz = values;
      valuesz.department = { 'id': values.department };
      valuesz.job = { 'id': values.job };
      const { title } = this.state;
      if (title === '新增角色') {
        insert(values)
          .then(res => {
            if (res && res.response && res.response.status === 201) {
              message.success('添加成功');
              $.setState({ visible: false });
              $.listRolePageable();
            }
          })
      } else {
        update(values)
          .then(res => {
            if (res && res.response && res.response.status === 204) {
              message.success('编辑成功');
              $.setState({ visible: false });
              $.listRolePageable();
            }
          })
      }
  };

  // 更新菜单
  handleUpdateMenus = () => {
    const param = { 'id': 0, "menus": [] };
    const menus: {}[] = [];
    const $ = this;
    this.state.checkedKeysResult.forEach(single => {
      const singleMenu: any = {};
      singleMenu.id = single;
      menus.push(singleMenu);
    });
    const { selectedRowKeys } = this.state;
    param.id = selectedRowKeys[0];
    param.menus = menus;
    updateRoleMenus(param)
      .then(res => {
        if (res && res.response && res.response.status === 204) {
          message.success('更新菜单成功');
          $.listRolePageable();
        }
      })
  }

  // 响应菜单树复选框的点击事件
  onCheck = (checkedKeys: any, e: any) => {
    const checkedKeysResult = [...checkedKeys, ...e.halfCheckedKeys]
    this.setState({ checkedKeys, checkedKeysResult })
  }

  // 分页参数变化
  handlePageChange = (page: number, size: number) => {
    this.setState({ page: page - 1, pageSize: size })
    this.listRolePageable();
  }

   // 确认删除
   handleDeleteConfirm = (record: { [x: string]: any; }) => {
    const $ = this;
    remove(record.id)
      .then(res => {
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.setState({ page: 0 });
          $.listRolePageable();
        }
      })
  }

  listAllMenu() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = $.getRequestParam();
    listAllMenu(param)
      .then((res: any) => {
        // 返回的数据需要转换成下拉选择树的数据(key的转换)
        // 这一步是为了转换的过程对表格的数据不造成影响
        const originTreeData = JSON.parse(JSON.stringify(res));
        handleOriginDataToTreeData(originTreeData);
        $.setState({ menuTreeData: originTreeData, isSpinning: false });
      })
      .catch((error: any) => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  listRolePageable() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = $.getRequestParam();
    listForPage(param)
      .then(res => {
        $.setState({ tableData: res.content, total: res.totalElements, checkedKeys: [], checkedKeysResult: [], selectedRowKeys: [], isSpinning: false });
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: '10%',
      },
      {
        title: '创建时间',
        dataIndex: 'gmtCreate',
        width: '20%',
        key: 'gmtCreate',
      },
      {
        title: '操作',
        key: 'action',
        width: '20%',
        render: (text: any, record: { [x: string]: any; departmentId?: null; }) => (
          <span>
            <Button type="primary" size="small" icon={ <EditOutlined/> } style={{marginRight: 5 }} onClick={() => this.editRole(record)} />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger" size="small" icon={ <DeleteOutlined/> } />
            </Popconfirm>
          </span>
        ),
      }
    ];

    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys: any, selectedRows: any[]) => {
        const role = selectedRows[0];
        const {menus} = role;
        const checkedKeys: any = [];
        const checkedKeysResult: any = [];
        // 只传入没有子节点的菜单的key
        menus.map((menu: { id: string | number; parentId: string | number}) =>  {
          let hasChildren = false;
          menus.map((secondMenu: { id: string | number; parentId: string | number}) =>  {
              if (secondMenu.parentId === menu.id) {
                hasChildren = true;
              }
          }
          );
          if (!hasChildren) {
            checkedKeys.push(menu.id);
          }
          checkedKeysResult.push(menu.id);
        }

        );
        this.setState({ checkedKeys, checkedKeysResult, selectedRowKeys })
      },
      getCheckboxProps: (record: { name: string; }) => ({
        disabled: record.name === 'Disabled User',
        name: record.name,
      }),
      type: 'radio'
    };

    // 表格分页属性
    const paginationProps = {
      simple: true,
      current: this.state.page + 1,
      pageSize: this.state.pageSize,
      // onShowSizeChange: (current,pageSize) => this.changePageSize(pageSize,current),
      onChange: (page: number, size: number) => this.handlePageChange(page, size),
    };

    const menuDataSource = this.state.menuTreeData;

    return (
      <div>
        <Row gutter={16}>
          <Col span={18}>
            <Input placeholder="根据角色名模糊匹配" style={{ width: 200, marginBottom: 10, marginRight: 5}} onChange={this.handleInputChange}/>
            <Button type="primary"  icon={ <SearchOutlined /> } style={{marginRight: 5 }}  onClick={this.search}>搜索</Button>
            <Button type="primary"  icon={ <PlusOutlined /> } style={{marginRight: 5 }} onClick={this.enableModal}>新增</Button>
            <Spin spinning={this.state.isSpinning}>
              <Table rowSelection={rowSelection} pagination={paginationProps} columns={columns} rowKey="id" dataSource={this.state.tableData} />
            </Spin>


            <RoleForm
              formRef={this.formRef}
              title={this.state.title}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
            />
          </Col>
          <Col span={6}>
            <Button type="primary" onClick={this.handleUpdateMenus} disabled={this.state.selectedRowKeys.length === 0}>保存</Button>
            { menuDataSource && menuDataSource.length ?
              <Tree
                checkable
                defaultExpandAll
                onCheck={this.onCheck}
                checkedKeys={this.state.checkedKeys}
                treeData={this.state.menuTreeData}/> :
              <Empty />
            }

          </Col>
        </Row>

      </div>
    );
  }
}


export default RolePage;

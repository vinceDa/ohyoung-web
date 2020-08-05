import React from 'react';

import { Row, Col, Input, Button, Table, Modal, Select, TreeSelect, Tree, Form, Switch, message, Popconfirm, Spin, Empty } from 'antd';

import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import { insert, listPageable, update, remove } from '@/services/system/user';

import { listAll as listAllRole } from '@/services/system/role';

import { listAll as listAllDepartment, listJobs } from '@/services/system/department';

import { handleOriginDataToTreeData } from '@/pages/system/user/utils/util';

interface Values {
  id: number;
  username: string;
  phone: string;
  email: string;
  departmentId: number;
  jobId: number;
  roleIds: number[];
  enable: boolean;
}

interface CollectionCreateFormProps {
  roleOptions: any;
  jobOptions: any;
  departmentTreeData: any;
  title: string
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
  handleDepartmentTreeSelect: (value: any) => void;
}

const UserForm: React.FC<CollectionCreateFormProps> = ({
  roleOptions,
  jobOptions,
  departmentTreeData,
  title,
  visible,
  formRef,
  onCreate,
  onCancel,
  handleDepartmentTreeSelect,
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
          <Form {...formItemLayout} form={form} ref={formRef} initialValues={{ departmentId: null, jobId: null, roles: [], enable: false }}>
            <Form.Item name="id">
                <Input style={{ display: 'none' }} />
            </Form.Item>
            <Form.Item label="名称" name="username" rules={ [{ required: true, message: '用户名称不能为空!' }] }>
                <Input placeholder="请输入用户名称" />
            </Form.Item>
            <Form.Item label="手机号码" name="phone">
                <Input placeholder="请输入手机号码" />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
               <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item label="所属部门" name="departmentId" rules={ [{ required: true, message: '所属部门不能为空!' }] }>
                  <TreeSelect
                    showSearch
                    onSelect={handleDepartmentTreeSelect}
                    treeNodeFilterProp="title"
                    style={{ width: 314 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={departmentTreeData}
                    placeholder="请选择部门"
                    treeDefaultExpandAll
                  />
            </Form.Item>
            <Form.Item label="所属岗位" name="jobId" rules={ [{ required: true, message: '所属岗位不能为空!' }] }>
                  <Select style={{ width: 314 }} optionLabelProp="title"> { jobOptions } </Select>
            </Form.Item>
            <Form.Item label="请选择角色" name="roleIds" rules={ [{ required: true, message: '角色不能为空!' }] }>
                <Select style={{ width: 314 }} optionLabelProp="title" mode="multiple" showArrow > { roleOptions } </Select>
            </Form.Item>
            <Form.Item label="是否启用" name="enable" valuePropName="checked">
                <Switch  checked={ form.getFieldValue("enable")}  onChange={checked => { formRef.current.setFieldsValue({ "enable": checked })}}/>
            </Form.Item>
          </Form>
        </Modal>
  );
};

class UserPage extends React.Component {
  state = {
    title: '',
    tableData: [],
    isSpinning: false,
    // 是否显示的下拉框的值
    isEnable: undefined,
    // 搜索框的值
    searchValue: null,
    departmentId: null,
    page: 0,
    pageSize: 10,
    total: 0,
    roleData: [],
    departmentTreeData: [],
    jobData: [],
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listUserPageable();
    this.listAllDepartment();
    this.listAllRole();
  }

  getRequestParam() {
    const param: any = {};
    const blurry = this.state.searchValue;
    const enable = this.state.isEnable;
    if (blurry != null && blurry !== '' && blurry !== 'undefined' ) {
      param.blurry = blurry;
    }
    if (enable != null && enable !== '' && enable !== 'undefined' ) {
      param.enable = enable;
    }
    const { departmentId } = this.state;
    if (departmentId != null && departmentId !== '') {
      param.departmentId = departmentId;
    }
    param.page = this.state.page;
    param.size = this.state.pageSize;
    return param;
  }

    // 响应左侧部门树节点的点击事件
    onSelect = (selectedKeys: any, e: { selected: any; }) => {
      let selectKeysz = selectedKeys;
      if (!e.selected) {
        selectKeysz = null;
      }
      this.setState({ departmentId: selectKeysz }, () => {
        this.listUserPageable();
      });
    }

  // 搜索
  search = () => {
    this.listUserPageable();
  }

  // 选择是否启用下拉框
  handleSelectChange = (value: any) => {
    this.state.isEnable = value;
  }

  // 点击新增按钮
  enableModal = () => {
    this.setState({ visible: true, title: '新增用户' });
  }

  // 点击编辑按钮
  editUser = (record: { jobId?: any; roles?: any;  departmentId?: any; roleIds?: any}) => {
    this.setState({ visible: true, title: '编辑用户' });
    const $ = this;
    const recordz = record;
    if (record.departmentId != null) {
        listJobs(record.departmentId)
          .then(res => {
            $.setState({ jobData: res });
          })
    }
    // record中的roles是对象集合, 反显需要修改成id的数组集合
    const { roles } = record;
    const roleArray: string[] = [];
    roles.forEach((item: { id: any; }) => {
      // string才反显
      roleArray.push(`${item.id}`);
    });
    recordz.roleIds = roleArray;
    if (record.jobId) {
      recordz.jobId = `${record.jobId}`;
    }
    this.formRef.current.setFieldsValue(recordz);
  }

  handleDepartmentTreeSelect = (value: any) => {
    const $ = this;
    // 部门变化时, 清空岗位的选择
    this.formRef.current.setFieldsValue({
      jobId: null
    });
    listJobs(value)
      .then(res => {
        $.setState({ jobData: res });
      })
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    const valuesz = values;
    this.setState({ isSpinning: true });
    valuesz.department = {'id': values.departmentId};
    valuesz.job = {'id': values.jobId};
    valuesz.roles = [];
    if (values.roleIds) {
      values.roleIds.forEach((data: any) => {
        valuesz.roles.push({'id': data});
      });
    }
      const { title } = this.state;
      if (title === '新增用户') {
        insert(valuesz)
          .then(res => {
            if (res && res.response && res.response.status === 201) {
              message.success('添加成功');
              $.setState({ visible: false });
              $.listUserPageable();
            }
            $.setState({ isSpinning: false });
          })
      } else {
        update(values)
          .then(res => {
            if (res && res.response && res.response.status === 204) {
              message.success('编辑成功');
              $.setState({ visible: false });
              $.listUserPageable();
            }
            $.setState({ isSpinning: false });
          })
      }
  };

  // 确认删除
  handleDeleteConfirm = (record: { id: any; }) => {
    this.setState({ isSpinning: true });
    const $ = this;
    remove(record.id)
      .then(res => {
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.setState({ page: 0 });
          $.listUserPageable();
        }
        $.setState({ isSpinning: false });
      })
  }

  // 点击是否显示按钮
  handleUserEnableOrHide = (record: any) => {
    const $ = this;
    const recordz = record;
    recordz.enable = !recordz.enable;
    $.setState({ isSpinning: true });
    update(record)
    .then(res => {
      if (res && res.response && res.response.status === 204) {
        $.listUserPageable();
      }
    })
  }

  // 分页参数变化
  handlePageChange = (page: number, size: any) => {
      this.setState({ page: page -1, pageSize: size })
      this.listUserPageable();
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  listUserPageable() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = $.getRequestParam();
    param.page = 0;
    listPageable(param)
    .then(res => {
      $.setState({ tableData: res.content, total: res.totalElements, isSpinning: false });
    })
    .catch(() => {
      $.setState({ isSpinning: false });
    });
  }

  listAllDepartment() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = {};
    listAllDepartment(param)
      .then(res => {
        // 返回的数据需要转换成下拉选择树的数据(key的转换)
        // 这一步是为了转换的过程对表格的数据不造成影响
        const originTreeData = JSON.parse(JSON.stringify(res));
        handleOriginDataToTreeData(originTreeData);
        $.setState({ departmentTreeData: originTreeData, isSpinning: false });
      })
      .catch(() => {
        $.setState({ isSpinning: false });
      });
  }

  listAllRole() {
    this.setState({ isSpinning: true });
    const $ = this;
    listAllRole()
      .then(res => {
        $.setState({ roleData: res, isSpinning: false });
      })
      .catch(() => {
        $.setState({ isSpinning: false });
      });
  }

  render() {
    const { Option } = Select;
    const columns = [
      {
        title: '名称',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '手机号码',
        dataIndex: 'phone',
        key: 'phone',
        width: '10%',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '10%',
      },
      {
        title: '所属部门',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: '10%',
      },
      {
        title: '岗位',
        dataIndex: 'jobName',
        key: 'jobName',
        width: '10%',
      },
      {
        title: '是否启用',
        dataIndex: 'enable',
        key: 'enable',
        width: '10%',
        render: (text: any, record: { enable: any; }) => (
          <Switch onChange={() => this.handleUserEnableOrHide(record)} checked={record.enable} />
        ),
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
        width: '12%',
        render: (text: any, record: any) => (
          <span>
            <Button type="primary" size="small" style={{ marginRight: 5 }}  icon={ <EditOutlined/> } onClick={() => this.editUser(record)}/>
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary" size="small" icon={ <DeleteOutlined/> } danger/>
            </Popconfirm>
          </span>
        ),
      }
    ];


    // 表格分页属性
    const paginationProps = {
      simple: true,
      current: this.state.page+1,
      pageSize: this.state.pageSize,
      total: this.state.total,
      // onShowSizeChange: (current,pageSize) => this.changePageSize(pageSize,current),
      onChange: (page: any, size: any) => this.handlePageChange(page, size),
    };

    const departmentDataSource = this.state.departmentTreeData;

    const roleOptions: any = []
    if (this.state.roleData.length) {
      this.state.roleData.map((role: { id: string | number; name: string; }) =>
        roleOptions.push(<Option key={role.id} value={role.id} title={role.name}>{role.name}</Option>)
      );
    }

    const jobOptions: any = [];
    if (this.state.jobData.length) {
      this.state.jobData.map((job: { id: string | number; name: string; }) =>
        jobOptions.push(<Option key={job.id} value={job.id} title={job.name}>{job.name}</Option>)
      );
    }

    return (
        <div>
           <Row gutter={16}>
            <Col span={3}>
              { departmentDataSource && departmentDataSource.length ?
                <Tree
                defaultExpandAll
                onSelect={this.onSelect}
                treeData={this.state.departmentTreeData}
                /> :
                <Empty description="暂无部门信息"/>
              }

            </Col>
            <Col span={21}>
                <Select placeholder="用户状态" allowClear style={{ width: 150, marginRight: 5 }} onChange={this.handleSelectChange}>
                      <Option value="true">启用</Option>
                      <Option value="false">禁用</Option>
                </Select>
                <Input placeholder="根据用户名或邮箱模糊匹配" style={{ width: 200, marginBottom: 10, marginRight: 5 }} onChange={this.handleInputChange}/>
                <Button type="primary"  icon={ <SearchOutlined /> }  style={{ marginRight: 5 }} onClick={this.search}>搜索</Button>
                <Button type="primary"  icon={ <PlusOutlined /> }  onClick={this.enableModal}>新增</Button>

              <Spin spinning={this.state.isSpinning}>
                <Table pagination={paginationProps} columns={columns} rowKey="id" dataSource={this.state.tableData} />
              </Spin>
              <UserForm
                departmentTreeData={this.state.departmentTreeData}
                roleOptions={roleOptions}
                jobOptions={jobOptions}
                title={this.state.title}
                visible={this.state.visible}
                formRef={this.formRef}
                onCancel={this.handleCancel}
                onCreate={this.handleCreate}
                handleDepartmentTreeSelect={this.handleDepartmentTreeSelect}
              />
            </Col>
          </Row>

        </div>

    );
  }
}


export default UserPage

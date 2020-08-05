import React from 'react';

import { Input, Button, Table, Modal, Select, TreeSelect, Form, Switch, message, Popconfirm, Spin } from 'antd';

import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import { insert, listAll, update, remove } from '@/services/system/department';

import { handleOriginDataToTreeData } from '@/pages/system/department/utils/util';

interface Values {
  id: number;
  name: string;
  parentId: number;
  description: number;
  enable: boolean;
}

interface CollectionCreateFormProps {
  title: string;
  treeData: any;
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const DepartmentForm: React.FC<CollectionCreateFormProps> = ({
  title,
  treeData,
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
          <Form {...formItemLayout} form={form} ref={formRef} initialValues={{ departmentId: null, jobId: null, roles: [], enable: false }}>
            <Form.Item name="id">
                <Input style={{ display: 'none' }} />
            </Form.Item>
            <Form.Item label="名称" name="name" rules={ [{ required: true, message: '部门名称不能为空!' }] }>
                <Input placeholder="请输入部门名称" />
            </Form.Item>
            <Form.Item label="上级部门" name="parentId">
                <TreeSelect
                  showSearch
                  treeNodeFilterProp="title"
                  style={{ width: 314 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={treeData}
                  placeholder="请选择上级部门"
                  treeDefaultExpandAll
                />
            </Form.Item>
            <Form.Item label="描述" name="description">
                <Input placeholder="请输入描述" />
            </Form.Item>
            <Form.Item label="是否启用" name="enable" valuePropName="checked">
                <Switch  checked={ form.getFieldValue("enable")}  onChange={checked => { formRef.current.setFieldsValue({ "enable": checked })}}/>
            </Form.Item>
          </Form>
        </Modal>
  );
};

class DepartmentPage extends React.Component {
  state = {
    title: '',
    isSpinning: false,
    tableData: [],
    treeData: [],
    // 是否显示的下拉框的值
    isEnable: '',
    // 搜索框的值
    searchValue: '',
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listAll();
  }

  getRequestParam() {
    const param = { blurry: '', enable: '' };
    if (this.state.searchValue != null) {
      param.blurry = this.state.searchValue;
    }
    if (this.state.isEnable != null) {
      param.enable = this.state.isEnable;
    }
    return param;
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  // 搜索
  search = () => {
    this.setState({ isSpinning: true });
    const param = this.getRequestParam();
    const $ = this;
    listAll(param)
      .then(res => {
        this.setState({ isSpinning: false });
        $.setState({ tableData: res });
      })
      .catch(error => {
        this.setState({ isSpinning: false });
        console.log(error);
      });
  }

  // 选择是否显示下拉框
  handleSelectChange = (value: string) => {
    this.state.isEnable = value;
  }

  // 点击新增按钮
  showModal = () => {
    this.setState({ visible: true, title: '新增部门' });
  }

  // 点击编辑按钮
  editDepartment = (record: any) => {
    this.formRef.current.setFieldsValue(record);
    this.setState({ visible: true, title: '编辑部门' });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    const { title } = this.state;
    $.setState({ visible: false });
      if (title === '新增部门') {
        insert(values)
          .then(res => {
            if (res && res.response && res.response.status === 201) {
              message.success('添加成功');
              $.listAll();
            }
          })
      } else {
        update(values)
          .then(res => {
            if (res && res.response && res.response.status === 204) {
              message.success('编辑成功');
              $.listAll();
            }
          })
      }
  };

  // 确认删除
  handleDeleteConfirm = (record: { id: any; }) => {
    const $ = this;
    remove(record.id)
      .then(res => {
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.listAll();
        }
      })
  }

  // 点击是否显示按钮
  handleDepartmentShowOrHide = (record: { enable: boolean; }) => {
    const $ = this;
    const recordz = record;
    if (record.enable) {
      recordz.enable = false;
    } else {
      recordz.enable = true;
    }
    update(recordz)
    .then(res => {
      if (res && res.response && res.response.status === 204) {
        $.listAll();
      }
    })
  }

  listAll() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = this.getRequestParam();
    listAll(param)
      .then((res: any) => {
        // 返回的数据需要转换成下拉选择树的数据(key的转换)
        // 这一步是为了转换的过程对表格的数据不造成影响
        const originTreeData = JSON.parse(JSON.stringify(res));
        handleOriginDataToTreeData(originTreeData);
        console.log("tableData: ", res);
        $.setState({ tableData: res, treeData: originTreeData, isSpinning: false });
      })
      .catch((error: any) => {
        console.log("error: ", error);
        this.setState({ isSpinning: false });
      });
  }

  render() {
    const { Option } = Select;
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '是否启用',
        dataIndex: 'enable',
        width: '10%',
        key: 'enable',
        render: (text: any, record: any) => (
          <Switch onChange={() => this.handleDepartmentShowOrHide(record)} checked={record.enable} />
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
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
        width: '12%',
        render: (record: { id: any; }) => (
          <span>
            <Button type="primary" size="small" icon={<EditOutlined />} style={{marginRight: 5 }} onClick={() => this.editDepartment(record)} />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger" size="small" icon={<DeleteOutlined />}/>
            </Popconfirm>
          </span>
        ),
      }
    ];


    return (
      <div>
        <Select placeholder="部门状态" allowClear style={{ width: 150, marginRight: 5 }} onChange={this.handleSelectChange}>
          <Option value='true'>启用</Option>
          <Option value='false'>禁用</Option>
        </Select>
        <Input placeholder="根据部门名模糊匹配" style={{ width: 200, marginBottom: 10, marginRight: 5 }} onChange={this.handleInputChange} />
        <Button type="primary"  icon={ <SearchOutlined /> } style={{marginRight: 5 }}  onClick={this.search}>搜索</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={this.showModal}>新增</Button>
        <Spin spinning={this.state.isSpinning}>
          <Table pagination={false} columns={columns} rowKey="id" dataSource={this.state.tableData} />
        </Spin>
        <DepartmentForm
          treeData={this.state.treeData}
          formRef={this.formRef}
          title={this.state.title}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    );
  }
}


export default DepartmentPage;

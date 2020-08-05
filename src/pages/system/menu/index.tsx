import React from 'react';

import { Input, InputNumber, Button, Radio, Table, Modal, Select, TreeSelect, Form, Switch, message, Popconfirm, Spin } from 'antd';

import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import  { insert, listAll, update, remove as removeMenu } from '@/services/system/menu';

import  { handleOriginDataToTreeData } from '@/pages/system/menu/utils/util';


interface Values {
  id: number;
  type: string;
  name: string;
  path: string;
  permissionTag: string;
  icon: string;
  parentId: number;
  sort: string;
  description: string;
  show: boolean
}

interface CollectionCreateFormProps {
  treeData: any;
  title: string
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const MenuForm: React.FC<CollectionCreateFormProps> = ({
  treeData,
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
          <Form {...formItemLayout} form={form} ref={formRef} initialValues={{ type: "0", show: true }}>
             <Form.Item name="id">
                  <Input style={{ display: 'none' }} />
              </Form.Item>
              <Form.Item label="菜单类型" name="type"  >
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="0">目录</Radio.Button>
                    <Radio.Button value="1">菜单</Radio.Button>
                    <Radio.Button value="2">按钮</Radio.Button>
                  </Radio.Group>
              </Form.Item>
              <Form.Item label="名称" name="name" rules={ [{ required: true, message: '菜单名称不能为空!' }]}>
                  <Input placeholder="请输入菜单名称" />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('type') !== '2' ? (
                    <Form.Item label="路由" name="path" rules={ [{ required: true, message: '路由地址不能为空!' }] }>
                        <Input placeholder="请输入路由地址" />
                    </Form.Item>
                  ) : null;
                }}
             </Form.Item>
             <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('type') === '2' ? (
                    <Form.Item label="权限标识" name="permissionTag" rules={ [{ required: true, message: '权限标识不能为空!' }] }>
                      <Input placeholder="请输入权限标识" />
                    </Form.Item>
                  ) : null;
                }}
             </Form.Item>
             <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('type') === '0' ? (
                    <Form.Item label="图标" name="icon" rules={ [{ required: true, message: '图标代码不能为空!' }] }>
                      <Input placeholder="请输入图标代码" />
                     </Form.Item>
                  ) : null;
                }}
             </Form.Item>
              <Form.Item label="上级菜单" name="parentId">
                  <TreeSelect
                    showSearch
                    treeNodeFilterProp="title"
                    style={{ width: 314 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={treeData}
                    placeholder="请选择上级菜单"
                    treeDefaultExpandAll
                  />
              </Form.Item>
              <Form.Item label="排序" name="sort" rules={ [{ required: true, message: '序号不能为空!' }] }>
                  <InputNumber min={1} max={20} style={{ width: 314 }} placeholder="请输入菜单序号" />
              </Form.Item>
              <Form.Item label="描述" name="description">
                  <Input placeholder="请输入菜单描述" />
              </Form.Item>
              <Form.Item label="是否显示" name="show">
                  <Switch checked={form.getFieldValue('show')} />
              </Form.Item>
          </Form>
        </Modal>
  );
};

class MenuPage extends React.Component {
  state = {
    title: '',
    isSpinning: false,
    tableData: [],
    treeData: [],
    // 是否显示的下拉框的值
    isShow: '',
    // 搜索框的值
    searchValue: '',
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listAll();
  }

  getRequestParam() {
    const param = { blurry: '', show: '' };
    if (this.state.searchValue != null) {
      param.blurry = this.state.searchValue;
    }
    if (this.state.isShow != null) {
      param.show = this.state.isShow;
    }
    return param;
  }

  // 搜索
  search = () => {
    this.setState({ isSpinning: true })
    const param = this.getRequestParam();
    const $ = this;
    listAll(param)
      .then(res => {
        $.setState({ tableData: res });
        this.setState({ isSpinning: false })
      })
      .catch(error => {
        console.log(error);
        this.setState({ isSpinning: false })
      });
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  // 选择是否显示下拉框
  handleSelectChange = (value: string) => {
    let valuez = value;
    if (value === 'undefined') {
      valuez = '';
    }
    this.state.isShow = valuez;
  }

  // 点击新增按钮
  showModal = () => {
    this.setState({ visible: true, title: '新增菜单' });
  }

  // 点击编辑按钮
  editMenu = (record: any) => {
    this.formRef.current.setFieldsValue(record);
    this.setState({ visible: true, title: '编辑菜单' });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    $.setState({ visible: false });
      const { title } = this.state;
      if (title === '新增菜单') {
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
  handleDeleteConfirm = (record: { [x: string]: any; }) => {
    const $ = this;
    removeMenu(record.id)
      .then(res => {
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.listAll();
        }
      })
  }

  // 点击是否显示按钮
  handleMenuShowOrHide = (record: { [x: string]: boolean; }) => {
    const $ = this;
    const recordz = record;
    if (record.show) {
      recordz.show = false;
    } else {
      recordz.show = true;
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
    const param = this.getRequestParam();
    const $ = this;
    listAll(param)
      .then((res: any) => {
        // 返回的数据需要转换成下拉选择树的数据(key的转换)
        // 这一步是为了转换的过程对表格的数据不造成影响
        const originTreeData = JSON.parse(JSON.stringify(res));
        handleOriginDataToTreeData(originTreeData);
        $.setState({ tableData: res, treeData: originTreeData, isSpinning: false });
      })
      .catch((error: any) => {
        console.log(error);
        $.setState({ isSpinning: false });
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
        title: '图标',
        dataIndex: 'icon',
        key: 'icon',
        width: '8%',
      },
      {
        title: '排序',
        dataIndex: 'sort',
        key: 'sort',
        width: '6%',
      },
      {
        title: '路由',
        dataIndex: 'path',
        width: '13%',
        key: 'path',
      },
      {
        title: '权限标识',
        dataIndex: 'permissionTag',
        width: '13%',
        key: 'path',
      },
      {
        title: '是否显示',
        dataIndex: 'show',
        width: '8%',
        key: 'show',
        render: (text: any, record: any) => (
          <Switch onChange={() => this.handleMenuShowOrHide(record)} checked={record.show} />
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
        width: '15%',
        key: 'gmtCreate',
      },
      {
        title: '操作',
        key: 'action',
        width: '12%',
        render: (text: any, record: any) => (
          <span>
            <Button type="primary"  icon={ <EditOutlined /> } style={{marginRight: 5 }} onClick={() => this.editMenu(record)} />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger" icon={ <DeleteOutlined /> } />
            </Popconfirm>
          </span>
        ),
      }
    ];


    return (
      <div>
        <Select placeholder="是否显示菜单" allowClear style={{ width: 150, marginRight: 5 }} onChange={this.handleSelectChange}>
          <Option value='true'>是</Option>
          <Option value='false'>否</Option>
        </Select>
        <Input placeholder="根据菜单名模糊匹配" style={{ width: 200, marginBottom: 10, marginRight: 5 }} onChange={this.handleInputChange}/>
        <Button type="primary"  icon={ <SearchOutlined /> } style={{marginRight: 5 }}  onClick={this.search}>搜索</Button>
        <Button type="primary"  icon={ <PlusOutlined /> } onClick={this.showModal}>新增</Button>
        <Spin spinning={this.state.isSpinning}>
          <Table pagination={false} columns={columns} rowKey="id" dataSource={this.state.tableData} />
        </Spin>
        <MenuForm
          formRef={this.formRef}
          treeData={this.state.treeData}
          title={this.state.title}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    );
  }
}


export default MenuPage;

import React from 'react';

import { Input, Button, Table, Select, Switch, message, Popconfirm, Spin } from 'antd';

import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import { listAll as listAllDepartment } from '@/services/system/department';

import { insert, listPageable, update, remove } from '@/services/system/job';

import { handleOriginDataToTreeData } from '@/pages/system/job/utils/util';

import JobForm from '@/pages/system/components/job/Form';

class JobPage extends React.Component {
  state = {
    title: '',
    isSpinning: false,
    tableData: [],
    page: 0,
    pageSize: 10,
    total: 0,
    departmentTreeData: [],
    departmentId: null,
    isEnable: '',
    // 搜索框的值
    searchValue: '',
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listPageable();
    this.listAllDepartment();
  }

  getRequestParam() {
    const param = { page: 0, size: 10, blurry: '', departmentId: null, enable: '' }
    param.page = this.state.page;
    param.size = this.state.pageSize;
    const { searchValue, departmentId, isEnable } = this.state;
    if (searchValue != null) {
      param.blurry = searchValue;
    }
    if (departmentId != null) {
      param.departmentId = departmentId;
    }
    if (isEnable != null) {
      param.enable = isEnable;
    }
    return param;
  }

  // 搜索
  search = () => {
    this.setState({ isSpinning: true });
    this.listPageable();
  }

  // 选择是否显示下拉框
  handleSelectChange = (value: string) => {
    this.state.isEnable = value;
  }

  // 点击新增按钮
  showModal = () => {
    this.setState({ visible: true, title: '新增岗位' });
  }

  // 点击编辑按钮
  editJob = (record: any) => {
    this.formRef.current.setFieldsValue(record);
    this.setState({ visible: true, title: '编辑岗位' });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    $.setState({ visible: false });
    const {title} = this.state;
    if (title === '新增岗位') {
      insert(values)
        .then(res => {
          if (res && res.response && res.response.status === 201) {
            message.success('添加成功');
            $.listPageable();
          }
        })
    } else {
      update(values)
        .then(res => {
          if (res && res.response && res.response.status === 204) {
            message.success('编辑成功');
            $.listPageable();
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
          $.setState({ page: 0 });
          $.listPageable();
        }
      })
  }

  // 点击是否显示按钮
  handleJobEnableOrDisable = (record: { enable: boolean; }) => {
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
          $.listPageable();
        }
      })
  }

  // 分页参数变化
  handlePageChange = (page: number, size: number) => {
    this.state.page = page - 1;
    this.setState({ page: page - 1, pageSize: size })
    this.listPageable();
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  listPageable() {
    this.setState({ isSpinning: true });
    const $ = this;
    const data = this.getRequestParam();
    listPageable(data)
      .then(res => {
        $.setState({ tableData: res.content, total: res.totalElements, isSpinning: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ isSpinning: false });
      });
  }

  listAllDepartment() {
    const $ = this;
    const param = this.getRequestParam();
    listAllDepartment(param)
      .then(res => {
        // 返回的数据需要转换成下拉选择树的数据(key的转换)
        // 这一步是为了转换的过程对表格的数据不造成影响
        const originDepartmentTreeData = JSON.parse(JSON.stringify(res));
        handleOriginDataToTreeData(originDepartmentTreeData);
        $.setState({ departmentTreeData: originDepartmentTreeData });
      })
      .catch(error => {
        console.log(error);
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
        title: '所属部门',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: '10%',
      },
      {
        title: '是否启用',
        dataIndex: 'enable',
        width: '10%',
        key: 'enable',
        render: (text: any, record: any) => (
          <Switch onChange={() => this.handleJobEnableOrDisable(record)} checked={record.enable} />
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
        render: (record: any) => (
          <span>
            <Button type="primary" size="small" icon={<EditOutlined />} style={{marginRight: 5 }} onClick={() => this.editJob(record)} />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger" size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </span>
        ),
      }
    ];

    // 表格分页属性
    const paginationProps = {
      simple: true,
      current: this.state.page + 1,
      pageSize: this.state.pageSize,
      total: this.state.total,
      // onShowSizeChange: (current,pageSize) => this.changePageSize(pageSize,current),
      onChange: (page: number, size: number) => this.handlePageChange(page, size),
    };


    return (
      <div>
        <Select placeholder="岗位状态" allowClear style={{ width: 150 }} onChange={this.handleSelectChange}>
          <Option value='true'>启用</Option>
          <Option value='false'>禁用</Option>
        </Select>
        <Input placeholder="根据岗位名模糊匹配" style={{ width: 200, marginBottom: 10 }} onChange={this.handleInputChange} />
        <Button type="primary"  icon={ <SearchOutlined /> } style={{marginRight: 5 }}  onClick={this.search}>搜索</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={this.showModal}>新增</Button>
        <Spin spinning={this.state.isSpinning}>
          <Table pagination={paginationProps} columns={columns} rowKey="id" dataSource={this.state.tableData} />
        </Spin>
        <JobForm
          formRef={this.formRef}
          departmentTreeData={this.state.departmentTreeData}
          title={this.state.title}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    );
  }
}


export default JobPage;

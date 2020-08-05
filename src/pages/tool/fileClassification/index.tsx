import React from 'react';

import { Input, Button, Table, Modal, Form, message, Popconfirm, Spin, Upload } from 'antd';

import {  DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

import { insert, listForPage, update, remove } from '@/services/tool/fileClassification';

interface Values {
  id: number;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

interface CollectionCreateFormProps {
  title: string;
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const FileClassificationForm: React.FC<CollectionCreateFormProps> = ({
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
          <Form {...formItemLayout} form={form} ref={formRef}>
            <Form.Item name="id">
                <Input style={{ display: 'none' }} />
            </Form.Item>
            <Form.Item>
              <Form.Item label="文件类型类型" name="name"  rules={ [{ required: true, message: '文件类型名不能文件类型类型!' }] }>
                <Input placeholder="请输入文件类型类型" />
              </Form.Item>
            </Form.Item>
          </Form>
        </Modal>
  );
};


class FileClassificationPage extends React.Component {
  state = {
    title: '',
    isSpinning: false,
    tableData: [],
    page: 0,
    pageSize: 10,
    // 搜索框的值
    searchValue: '',
    visible: false,
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listForPage();
  }

  getRequestParam() {
    const param = { 'page': 0, "size": 10, "blurry": '' };
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

  // 搜索
  search = () => {
    const $ = this;
    const param = this.getRequestParam();
    $.setState({ isSpinning: true });
    listForPage(param)
      .then(res => {
        $.setState({ tableData: res, isSpinning: false });
      })
      .catch(error=> {
        console.log(error);
        $.setState({ isSpinning: false });
      });

  }

  // 点击新增按钮
  showModal = () => {
    this.setState({ visible: true, title: '新增文件类型' });
  }

  // 点击编辑按钮
  editConnection = (record: any) => {
    this.formRef.current.setFieldsValue(record);
    this.setState({ visible: true, title: '编辑文件类型' });
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchValue: e.target.value });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    $.setState({ isSpinning: true });
    const {title} = this.state;
    if (title === '新增文件类型') {
      insert(values)
        .then(res => {
          if (res && res.response && res.response.status === 201) {
            message.success('添加成功');
            $.setState({ visible: false });
            $.listForPage();
          }
        })
    } else {
      update(values)
        .then(res => {
          if (res && res.response && res.response.status === 204) {
            message.success('编辑成功');
            $.setState({ visible: false });
            $.listForPage();
          }
        })
      $.setState({ isSpinning: false });
    }

  };

  // 确认删除
  handleDeleteConfirm = (record: { id: any; }) => {
    const $ = this;
    $.setState({ isSpinning: true });
    remove(record.id)
      .then(res => {
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.listForPage();
        }
      })
      $.setState({ isSpinning: false });
  }

  listForPage() {
    this.setState({ isSpinning: true });
    const $ = this;
    const param = this.getRequestParam();
    listForPage(param)
      .then((res: any) => {
        console.log('listForPage: ', res);
        $.setState({ tableData: res, isSpinning: false });
      })
      .catch((error: any)=> {
        console.log(error)
        $.setState({ isSpinning: false });
      });
  }


  render() {
    const columns = [
      {
        title: '文件类型名称',
        dataIndex: 'name',
        key: 'name',
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
            <Button type="primary" size="small" icon={<EditOutlined />} style={{ marginRight: 3 }} onClick={() => this.editConnection(record)} />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger" size="small" style={{ marginRight: 3 }} icon={<DeleteOutlined />} />
            </Popconfirm>
            <Button type="primary" size="small" icon={<DownloadOutlined />} style={{ marginRight: 3 }} onClick={() => this.fileDownload(record)} />
          </span>
        ),
      }
    ];

    const props = {
      name: "file",
      // 设置只上传一张图片，根据实际情况修改
      showUploadList: false,
      // 手动上传
      customRequest: (info: { file: string | Blob; }) => {
        const formData = new FormData();
        // 名字和后端接口名字对应
        formData.append('file', info.file);
        fetch('/server/api/v1/tool/fileStorage', {
          method: "POST",
          headers: {
            "Authorization": localStorage.getItem("token")
          },
          body: formData
        }).then(res => {
          console.log('uploadFile: ', res);
          if (res) {
            message.success('添加成功');
          }
        }).catch(error => {
          console.log('error: ', error);
          message.error('上传失败！');
          }
        );
      },
      // 删除图片调用
      onRemove: (file: any) => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      listType: "picture-card",
      // 控制上传图片格式
      beforeUpload: (file: { size: number; }) => {
        const limitSize = file.size / 1024 / 1024 < 100;
        if (!limitSize) {
          message.error('文件类型大小必须小于100MB!');
        }
        return limitSize;
      },
    };

    return (
      <div>
        <Input placeholder="根据文件类型名模糊匹配" style={{ width: 250, marginBottom: 10, marginRight: 5 }} onChange={this.handleInputChange} />
        <Button type="primary"  icon={ <SearchOutlined /> } style={{ marginRight: 5 }}  onClick={this.search}>搜索</Button>
        <Button type="primary"  icon={ <PlusOutlined /> } style={{ marginRight: 5 }}  onClick={this.showModal}>新增</Button>
        <Spin spinning={this.state.isSpinning}>
          <Table pagination={false} columns={columns} rowKey="id" dataSource={this.state.tableData} />
        </Spin>
        <FileClassificationForm
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


export default FileClassificationPage;

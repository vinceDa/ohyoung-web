import React from 'react';

import { Input, Button, Table, Modal, Popconfirm, Form, Switch, message, Spin, Tag } from 'antd';

import { PlusOutlined} from '@ant-design/icons';

import { listPageable, insert, update, remove, start, pause, resume } from '@/services/tool/quartz';

interface Values {
  id: number;
  name: string;
  classPath: string;
  cronExpression: string;
  methodName: string;
  triggerName: string;
  enable: boolean;
  description: string;
}

interface CollectionCreateFormProps {
  title: string;
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const QuartzForm: React.FC<CollectionCreateFormProps> = ({
  title,
  visible,
  formRef,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { TextArea  } = Input;
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
            <Form.Item label="任务名" name="name" rules={ [{ required: true, message: '任务名不能为空!' }] }>
                <Input placeholder="请输入任务名" />
            </Form.Item>
            <Form.Item label="类路径" name="classPath" rules={ [{ required: true, message: '类路径不能为空!' }] }>
                <Input placeholder="请输入类路径, 包名+类名" />
            </Form.Item>
            <Form.Item label="cron表达式" name="cronExpression" rules={ [{ required: true, message: 'cron表达式不能为空!' }] }>
                <Input placeholder="请输入cron表达式" />
            </Form.Item>
            <Form.Item label="方法名" name="methodName" rules={ [{ required: false, message: '方法名不能为空!' }] }>
                <Input placeholder="请输入方法名" />
            </Form.Item>
            <Form.Item label="触发器" name="triggerName" rules={ [{ required: false, message: '触发器不能为空!' }] }>
                <Input placeholder="请输入触发器" />
            </Form.Item>
            <Form.Item label="任务状态" name="enable" valuePropName="checked">
                <Switch  checked={ form.getFieldValue("enable")}  onChange={checked => { formRef.current.setFieldsValue({ "enable": checked })}}/>
            </Form.Item>
            <Form.Item label="描述" name="description" rules={ [{ required: false, message: '方法名不能为空!' }] }>
               <TextArea row={2}
                  placeholder="添加描述"
                />
            </Form.Item>
          </Form>
        </Modal>
  );
};

class QuartzPage extends React.Component {
  state = {
    title: '',
    tableData: [],
    isSpinning: false,
    visible: false
  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listPageable();
  }

   // 点击新增按钮
   showModal = () => {
    this.setState({ visible: true, title: '新增' });
  }

  // 点击编辑按钮
  editQuartz = (record: any) => {
    this.formRef.current.setFieldsValue(record);
    this.setState({ visible: true, title: '编辑' });
  }

  // 启动定时任务
  startQuartz = (record: { id: any; }) => {
    start(record.id)
      .then(res => {
        console.log("startQuartz: ", res);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // 暂停定时任务
  pauseQuartz = (record: { id: any; }) => {
    pause(record.id)
      .then(res => {
        console.log("pause: ", res);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // 重启定时任务
  resumeQuartz = (record: { id: any; }) => {
    resume(record.id)
      .then(res => {
        console.log("resumeQuartz: ", res);
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = (values: any) => {
    const $ = this;
    const {title} = this.state;
      if (title === '新增') {
        insert(values)
          .then(res => {
            if (res && res.response && res.response.status === 201) {
              message.success('添加成功');
              $.setState({ visible: false });
              $.listPageable();
            }
          })
      } else {
        update(values)
          .then(res => {
            if (res && res.response && res.response.status === 204) {
              message.success('编辑');
              $.setState({ visible: false });
              $.listPageable();
            }
          })
      }
  };

   // 确认删除
   handleDeleteConfirm = (record: { [x: string]: any; }) => {
    const $ = this;
    remove(record.id)
      .then(res => {
        console.log('delete', res);
        if (res && res.response && res.response.status === 200) {
          message.success('删除成功');
          $.setState({ page: 0 });
          $.listPageable();
        }
      })
  }

  listPageable() {
    this.setState({ isSpinning: true });
    const $ = this;
    listPageable()
      .then((res: any) => {
        $.setState({ tableData: res, isSpinning: false });
      })
      .catch((error: any) => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  render() {

    const columns = [
      {
        title: '任务名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类路径',
        dataIndex: 'classPath',
        key: 'classPath',
        width: '10%',
      },
      {
        title: 'cron表达式',
        dataIndex: 'cronExpression',
        key: 'cronExpression',
        width: '10%',
      },
      {
        title: '方法名',
        dataIndex: 'methodName',
        key: 'methodName',
        width: '10%',
      },
      {
        title: '触发器名称',
        dataIndex: 'triggerName',
        key: 'triggerName',
        width: '10%',
      },
      {
        title: '任务状态',
        dataIndex: 'enable',
        key: 'enable',
        width: '8%',
        render: (text: any, record: { enable: any; }) => (
          record.enable
          ? <Tag color="processing">进行中</Tag>
          : <Tag color="error">已暂停</Tag>
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: '15%',
      },
      {
        title: '创建时间',
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
        width: '15%',
      },
      {
        title: '操作',
        key: 'action',
        width: '12%',
        render: (text: any, record: { [x: string]: any; id: any }) => (
          <span>
            <Button type="link" size="small" onClick={() => this.editQuartz(record)}>编辑</Button>
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDeleteConfirm(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" size="small">删除</Button>
            </Popconfirm>
            {
              record.enable
                ?    <Button type="link" size="small" onClick={() => this.pauseQuartz(record)}>暂停</Button>
                :   <Button type="link" size="small" onClick={() => this.startQuartz(record)}>执行</Button>
            }
          </span>
        ),
      }
    ]

    return(
      <div>
        <Button type="primary" icon={<PlusOutlined/>} onClick={this.showModal}>新增</Button>
        <Spin spinning={this.state.isSpinning}>
          <Table style={{ marginBottom: 20 }} columns={columns} pagination={false} rowKey="id"
                 dataSource={this.state.tableData}/>
        </Spin>
        <QuartzForm
          formRef={this.formRef}
          title={this.state.title}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    )
  }
}

export default QuartzPage;

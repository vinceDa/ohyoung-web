import React from 'react';
import { Form, Input, Modal, Switch, TreeSelect } from 'antd';

interface Values {
  id: number;
  name: string;
  departmentId: number;
  enable: boolean;
}

interface CollectionCreateFormProps {
  title: string;
  departmentTreeData: any;
  visible: boolean;
  formRef: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const JobForm: React.FC<CollectionCreateFormProps> = ({
                                                        title,
                                                        departmentTreeData,
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
        <Form.Item label="名称" name="name" rules={ [{ required: true, message: '岗位名称不能为空!' }] }>
          <Input placeholder="请输入岗位名称" />
        </Form.Item>
        <Form.Item label="所属部门" name="departmentId">
          <TreeSelect
            showSearch
            treeNodeFilterProp="title"
            style={{ width: 314 }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={departmentTreeData}
            placeholder="请选择部门"
            treeDefaultExpandAll
          />
        </Form.Item>
        <Form.Item label="是否启用" name="enable" valuePropName="checked">
          <Switch  checked={ form.getFieldValue("enable")}  onChange={checked => { formRef.current.setFieldsValue({ "enable": checked })}}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobForm;

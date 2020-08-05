import React from 'react';

import { Input, Button, Table, Form, message, Checkbox, Spin, Divider, Select, Space } from 'antd';

import {
  listTable,
  listFieldByTableName,
  listSettingByTableName,
  insertSettingForTable,
  generateCode,
  updateField
} from '@/services/tool/generate';
import {listAll as listAllFile} from '@/services/tool/fileStorage';
import { CheckOutlined } from '@ant-design/icons';

interface Field {
  author: string;
  packageName: string;
  interfaceName: string;
}

interface TableInfo {
  charset: string
  collation: string
  gmtCreate: string
  databaseId: number
  id: number
  key: string
  name: string
  title: string
}

const GenerateForm = ({ formRef, tableId: tableName }) => {
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

  const onFinish = (values: any) => {
    values.tableName = tableName;
    insertSettingForTable(values)
      .then(res => {
        if (res && res.response && res.response.status === 204) {
          message.success('保存成功');
        }
      });
  };

  return (
    <Form {...formItemLayout} form={form} ref={formRef} onFinish={onFinish}>
      <Button type="primary" icon={<CheckOutlined/>} htmlType="submit">保存</Button>
      <Divider>生成配置</Divider>
      <Form.Item label="作者" name="author" rules={[{ required: true, message: '作者名不能为空!' }]}>
        <Input placeholder="请输入作者名, 用于标注每个类上方的作者"/>
      </Form.Item>
      <Form.Item label="包名" name="packageName" rules={[{ required: true, message: '包名不能为空!' }]}>
        <Input placeholder="请输入包名, 包名是每个类文件生成的父目录"/>
      </Form.Item>
      <Form.Item label="接口名" name="interfaceName" rules={[{ required: true, message: '接口名不能为空!' }]}>
        <Input placeholder="请输入接口名, 用于接口路径生成以及接口文档编写"/>
      </Form.Item>
    </Form>
  );
};

class GeneratePage extends React.Component {
  state = {
    tableName: null,
    selectedTableInfos: [],
    tableData: [],
    fieldTableData: [],
    isSpinning: false,
    tableCheckedKeys: [],
    synchronizeButtonDisabled: true

  };

  formRef: any = React.createRef();

  componentDidMount() {
    this.listTable();
    this.listAllFile(1);
  }

  handleConfigSelectChange = (value: any) => {
    this.setState({ configJsonId: value });
  }

  handleFiledRequiredChange = (e: any, record: any) => {
    record.nullable = !e.target.checked;
    const $ = this;
    this.setState({ isSpinning: true });
    updateField(record)
      .then(res => {
        $.setState({ isSpinning: false});
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  handleFormTypeSelectChange = (record: any, value: any) => {
    if (!value) {
      value = '';
    }
    record.formType = value;
    const $ = this;
    this.setState({ isSpinning: true });
    updateField(record)
      .then(res => {
        console.log('res: ', res);
        $.setState({ isSpinning: false});
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  listAllFile = (classificationId: any) => {
    const $ = this;
    $.setState({ isSpinning: true });
    listAllFile(classificationId)
      .then(res => {
        console.log('res: ', res);
        $.setState({ isSpinning: false, configJsonData: res });
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  generateCodeConfirm = () => {
    const param = { tables: []};
    const $ = this;
    this.state.selectedTableInfos.forEach((item: TableInfo) => {
      console.log('generateCodeConfirm item: ', item);
      const key: string = item.key;
      if (key.indexOf('table') !== -1) {
        param.tables.push(item.name);
      }
    });
    console.log('params: ', param);
    generateCode(param)
      .then(res => {
        console.log('res: ', res);
        $.setState({ isSpinning: false });
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  };

  /*synchronizeTableInfo = () => {
    const {selectedTableInfos} = this.state;
    const $ = this;
    refreshByTableInfos(selectedTableInfos)
      .then((res: any) => {
        console.log("synchronizeTableInfo: ", res);
        message.success('同步成功');
        $.listTable();
        this.state.tableCheckedKeys = [];
        this.state.synchronizeButtonDisabled = true;
        $.setState({ isSpinning: false });
      })
      .catch((error: any) => {
        console.log('error: ', error);
        message.success('同步失败');
        $.setState({ isSpinning: false });
      });
  }*/

  listTable() {
    this.setState({ isSpinning: true });
    const $ = this;
    listTable()
      .then((res: any) => {
        $.setState({ tableData: res, isSpinning: false });
      })
      .catch((error: any) => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  handleSelectChange(value: string)  {
    const $ = this;
    $.setState({ tableName: value, isSpinning: true });
    listFieldByTableName(value)
      .then(res => {
        $.setState({ fieldTableData: res, isSpinning: false });
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  listSettingByTableId(tableId: any) {
    const $ = this;
    $.setState({ isSpinning: true });
    listSettingByTableName(tableId)
      .then((res: any) => {
        let resz: Field = { author: '', packageName: '', interfaceName: '' };
        if (res[0]) {
          resz = res[0];
        }
        $.formRef.current.setFieldsValue(resz);
        $.setState({ isSpinning: false });
      })
      .catch(error => {
        console.log(error);
        $.setState({ isSpinning: false });
      });
  }

  render() {
    const { Option } = Select;
    const columns = [
      {
        title: '字段名',
        dataIndex: 'columnName',
        key: 'name',
      },
      {
        title: '字段类型',
        dataIndex: 'columnType',
        key: 'type',
        width: '10%',
      },
      {
        title: '是否必填',
        dataIndex: 'nullable',
        key: 'nullable',
        width: '10%',
        render: (text: any, record: any) => (
          <span>
            <Checkbox checked={!record.nullable} onChange={e => this.handleFiledRequiredChange(e ,record)}/>
          </span>
        ),
      },
      {
        title: '字段描述',
        dataIndex: 'columnComment',
        key: 'columnComment',
        width: '20%'
      },
      {
        title: '表单类型',
        dataIndex: 'formType',
        key: 'formType',
        width: '20%',
        render: (text: any, record: any) => (
          <span>
            <Select style={{ width: 100 }} value={record.formType}  onChange = { value => this.handleFormTypeSelectChange(record, value) } allowClear>
                <Option value="input">input</Option>
                <Option value="checkbox">checkbox</Option>
                <Option value="radio">radio</Option>
                <Option value="select">select</Option>
                <Option value="switch">switch</Option>
            </Select>
          </span>
        ),
      },
      {
        title: '查询',
        dataIndex: 'queryType',
        key: 'queryType',
        width: '10%',
      },
      {
        title: '创建时间',
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
        width: '10%',
      },
    ];

    const tableOptions: any = [];
    this.state.tableData.map((tableName: string) =>
      tableOptions.push(<Option key={tableName} value={tableName} title={tableName}>{tableName}</Option>)
    );
    console.log('tableOptions', tableOptions);

    return (
      <div>
        <Spin spinning={this.state.isSpinning}>
            <Select placeholder="请选择表" style={{ width: 200, marginRight: 5 }} onChange={(value: string) => this.handleSelectChange(value)}>
              { tableOptions }
            </Select>
            <Button type="primary"    style={{ marginRight: 5 }} onClick={this.save}>保存</Button>
            <Button type="primary"    onClick={this.generateCodeConfirm}>生成</Button>
          <Table style={{ marginBottom: 20 }} columns={columns} pagination={false} rowKey="id" size="middle"
                 dataSource={this.state.fieldTableData}/>
        </Spin>
        {
          this.state.tableName == null ? '' :
            <GenerateForm formRef={this.formRef} tableId={this.state.tableName}/>
        }

      </div>

    );
  }
}

export default GeneratePage;

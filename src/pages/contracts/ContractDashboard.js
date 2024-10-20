import React, { useEffect, useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Col, DatePicker, Divider, Input, Radio, Row, Select, Space, Table, Tabs, Tag } from 'antd';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { ClearOutlined, FileAddOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { getUserMyCashier } from '../../utils/LocalData';
import cashiersServices from '../../services/CashiersServices';
import { columnActionsDef, columnDatetimeDef, columnDef, columnMoneyDef, columnNumberDef } from '../../utils/ColumnsDefinitions';
import contractsServices from '../../services/ContractsServices';
import { isEmpty } from 'lodash';
import ContractPreview from '../../components/previews/ContractPreview';

const { Option } = Select;
const { Search } = Input;

function ContractDashboard() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);

  const [ableToProcess, setIsAbleToProcess] = useState(false);

  const [filter, setFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [contractStatusFilter, setContractFilterStatus] = useState(0);
  
  const [openPreview, setOpenPreview] = useState(false);

  const [entitySelectedId, setEntitySelectedId] = useState(0);

  const [contractsData, setContractsData] = useState(0);

  useEffect(() => {
    checkIfAbleToProcess();
    loadData();
  }, []);

  async function loadData() {
    try {
      setFetching(true);
      const response = await contractsServices.find();
      console.log(response.data);
      setContractsData(response.data);
      setFetching(false);
    } catch(err) {
      setFetching(false);
    }
  }

  async function checkIfAbleToProcess() {
    setFetching(true);

    const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());

    const { isOpen, currentShiftcutId } = response.data[0];

    if (isOpen === 1 && currentShiftcutId !== null) {
      setIsAbleToProcess(true);
    }

    setFetching(false);
  }

  function getDataToShow() {
    if (contractStatusFilter === 0 && monthFilter === null)
      return contractsData;
    
    return (!isEmpty(contractsData) ? contractsData : []).filter((x) => (
      (contractStatusFilter === 0 || x.contractStatus === contractStatusFilter)
      &&
      (monthFilter === null || moment(x.contractDatetime).format("MM-YYYY") === monthFilter.format("MM-YYYY"))
    ))
  }
  
  function defaultDate() {
    return moment();
  };

  const columns = [
    // columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Número', dataKey: 'contractId'}),
    columnDatetimeDef({title: 'Fecha', dataKey: 'contractDatetime'}),
    columnDef({title: 'Cliente', dataKey: 'customerFullname', ifNull: '-'}),
    columnNumberDef({title: 'N° Beneficiarios', dataKey: 'beneficiaries', ifNull: '0' }),
    // columnDef({title: 'Estado', dataKey: 'statusName'}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Estado'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (text, record, index) => {
        return (
          <Tag
            color={
              record.contractStatus === 1 ? 'orange' : record.contractStatus === 2 ? 'geekblue' : record.contractStatus === 3 ? 'magenta' : 'white'
            }
          >
            {record.statusName}
          </Tag>
        )
      }
    },
    columnMoneyDef({title: 'Valor Total', dataKey: 'contractTotal'}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'contractId',
        edit: false,
        detailAction: (value) => {
          setEntitySelectedId(value);
          setOpenPreview(true);
        },
      }
    )
  ];

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <Button
              type={'primary'}
              icon={<FileAddOutlined />}
              loading={fetching}
              onClick={() => {
                navigate('/main/contracts/new')
              }}
            >
              Nuevo contrato
            </Button>
            <Button
              icon={<SyncOutlined />}
              loading={fetching}
              onClick={() => {
                checkIfAbleToProcess();
              }}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
        {
          !ableToProcess ?
          <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Alert
              message="La caja que usted tiene asignada se encuentra actualmente cerrada, por lo que no podrá generar documentos para la cancelación de contratos"
              type="warning"
              showIcon
              style={{ padding: '2px 5px', fontSize: 12 }}
            />
          </Col> : <></>
        }
        {/* <Divider /> */}
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0 }}>Filtros</p>
        </Col>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <DatePicker 
              locale={locale}
              format="MMMM-YYYY"
              picker='month'
              value={monthFilter}
              allowClear={false}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setMonthFilter(datetimeMoment);
              }}
            />
            <Radio.Group
              options={([
                {id: 0, name: 'Todos'},
                {id: 1, name: 'Pendientes'},
                {id: 2, name: 'Autorizados'},
                {id: 3, name: 'Rechazados'},
              ] || []).map((x) => ({ label: x.name, value: x.id }))}
              onChange={(e) => {
                setContractFilterStatus(e.target.value);
              }}
              value={contractStatusFilter}
              optionType="button"
              buttonStyle='solid'
            />
          </Space>
        </Col>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <Search
              name={'filter'}
              value={filter} 
              placeholder="Buscar contrato..." 
              allowClear 
              style={{ width: 300 }}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button
              icon={<ClearOutlined />}
              loading={fetching}
              onClick={() => {
                setContractFilterStatus(0);
                setMonthFilter(null);
              }}
            >
              Reestablecer filtros
            </Button>
          </Space>
        </Col>
        <Col
          span={24}
          style={{
            display: 'flex',
            // flexDirection: 'row',
            // justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #d9d9d9',
            borderRadius: 5,
            padding: 5,
            boxShadow: '3px 3px 5px 0px #d9d9d9'
          }}>
          <Table 
            columns={columns}
            rowKey={'id'}
            size={'small'}
            dataSource={getDataToShow() || []}
            style={{ width: '100%' }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30'],
              showQuickJumper: true
            }}
            loading={fetching}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  // setEntitySelectedId(record.id);
                  // setOpenPreview(true);
                }
              };
            }}
          />
        </Col>
      </Row>
      <ContractPreview
        open={openPreview}
        contractId={entitySelectedId}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default ContractDashboard;

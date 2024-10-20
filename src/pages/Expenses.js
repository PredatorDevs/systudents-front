import { Col, Row, Button, DatePicker, Table, Space, Select, Input, Radio, Checkbox } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { ClearOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { TableContainer } from '../styled-components/TableContainer';
import { columnActionsDef, columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../utils/ColumnsDefinitions';
import { customNot } from '../utils/Notifications';
import { CompanyInformation } from '../styled-components/CompanyInformation';
import expensesServices from '../services/ExpensesServices';
import ExpensePreview from '../components/previews/ExpesePreview';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import generalsServices from '../services/GeneralsServices';
import { filterData } from '../utils/Filters';
import StatCard from '../components/cards/StatisticCard';

const { Search } = Input;
const { Option } = Select;

function Expenses() {
  const [fetching, setFetching] = useState(false);
  const [entityRefreshData, setEntityRefreshData] = useState(0);

  const [accAccSearchFilter, setAccAccSearchFilter] = useState('');
  const [showIvaExpensesOption, setShowIvaExpensesOption] = useState(1);

  const [filter, setFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [expenseTypeFilter, setExpenseTypeFilter] = useState(0);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(0);
  const [expenseAccAccountSelected, setExpenseAccAccountSelected] = useState(0);

  const [accAccountsData, setAccAccountsData] = useState([]);
  const [expenseTypesData, setExpenseTypesData] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);

  const [entityData, setEntityData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [entitySelectedId, setEntitySelectedId] = useState(0);

  const navigate = useNavigate();

  function loadData(){
    setFetching(true);
    expensesServices.find()
    .then((response) => {
      setEntityData(response.data);
      setFetching(false);
    })
    .catch((error) => {
      customNot('error', 'Sin información', 'Revise su conexión a la red');
      setFetching(false);
    });
  }

  async function loadGenData() {
    setFetching(true);
    try {
      const response1 = await generalsServices.findPaymentMethods();
      const response2 = await expensesServices.findTypes();
      
      const accAccRes = await generalsServices.findAccountingAccounts();

      setPaymentMethodsData(response1.data);
      setExpenseTypesData(response2.data);
      setAccAccountsData(accAccRes.data);

      setFetching(false);
    } catch(error) {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadData();
    loadGenData();
  }, [ entityRefreshData ]);

  const columns = [
    columnDef({title: 'Cod Int.', dataKey: 'expenseId', ifNull: '-'}),
    columnDef({title: 'N° Doc', dataKey: 'documentNumber', ifNull: '-'}),
    columnDatetimeDef({title: 'Fecha', dataKey: 'documentDatetime'}),
    // columnDef({title: 'Tipo', dataKey: 'expenseTypeName', ifNull: '-'}),
    columnDef({title: 'Cuenta', dataKey: 'accountingNum', ifNull: '-'}),
    columnDef({title: '', dataKey: 'accountingName', ifNull: '-'}),
    columnDef({title: 'Pago', dataKey: 'paymentMethodName'}),
    columnDef({title: 'Concepto', dataKey: 'concept'}),
    columnIfValueEqualsTo({title: '', dataKey: 'isVoided', valueToCompare: 1 }),
    columnMoneyDef({title: 'Gravado', dataKey: 'taxedAmount'}),
    columnMoneyDef({title: 'Exento', dataKey: 'noTaxedAmount'}),
    columnMoneyDef({title: 'IVA', dataKey: 'iva'}),
    columnMoneyDef({title: 'Total', dataKey: 'amount'}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'expenseId',
        detailAction: (value) => {
          setEntitySelectedId(value);
          setOpenPreview(true);
          // alert(value);
        },
        edit: false
      }
    ),
  ];

  function defaultDate() {
    return moment();
  };

  function getDataToShow() {
    if (paymentMethodFilter === 0 && expenseTypeFilter === 0 && monthFilter === null && expenseAccAccountSelected === 0)
      return entityData;
    
    return entityData.filter((x) => (
      (paymentMethodFilter === 0 || x.paymentMethodId === paymentMethodFilter)
      &&
      (expenseAccAccountSelected === 0 || x.accountingAccountId === expenseAccAccountSelected)
      &&
      (expenseTypeFilter === 0 || x.expenseTypeId === expenseTypeFilter)
      &&
      (showIvaExpensesOption === 1 || (showIvaExpensesOption === 2 && +x.iva > 0) || (showIvaExpensesOption === 3 && +x.iva <= 0))
      &&
      (monthFilter === null || moment(x.documentDatetime).format("MM-YYYY") === monthFilter.format("MM-YYYY"))
    ))
  }

  const dataToRender = filterData(getDataToShow(), filter, ['documentNumber', 'concept']) || [] || [];

  const statisticsData = dataToRender?.reduce((acc, x) => {
    return {
      expensesWithIva: acc.expensesWithIva + (+x.iva > 0 ? 1 : 0),
      expensesWithoutIva: acc.expensesWithoutIva + (+x.iva <= 0 ? 1 : 0),
      expensesTotalTaxedAmount: acc.expensesTotalTaxedAmount + +x.taxedAmount,
      expensesTotalNoTaxedAmount: acc.expensesTotalNoTaxedAmount + +x.noTaxedAmount,
      expensesTotalIva: acc.expensesTotalIva + +x.iva,
      expensesTotal: acc.expensesTotal + +x.amount,
    };
  }, {
    expensesWithIva: 0,
    expensesWithoutIva: 0,
    expensesTotalTaxedAmount: 0,
    expensesTotalNoTaxedAmount: 0,
    expensesTotalIva: 0,
    expensesTotal: 0
  });

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <DatePicker 
              locale={locale}
              format="MMMM-YYYY"
              picker='month'
              value={monthFilter}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setMonthFilter(datetimeMoment);
              }}
            />
            {/* <Select 
              dropdownStyle={{ width: '200px' }} 
              style={{ width: '200px' }} 
              value={expenseTypeFilter} 
              onChange={(value) => {
                setExpenseTypeFilter(value);
              }}
              optionFilterProp='children'
              showSearch
              filterOption={(input, option) =>
                (option.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option key={0} value={0} disabled>{'Tipo'}</Option>
              {
                (expenseTypesData || []).map((element, index) => (
                  <Option key={index} value={element.id}>{element.name}</Option>
                ))
              }
            </Select> */}
            <Select 
              dropdownStyle={{ width: '250px' }} 
              style={{ width: '250px' }}
              value={expenseAccAccountSelected}
              onChange={(value) => {
                setExpenseAccAccountSelected(value);
                setAccAccSearchFilter('');
              }}
              optionFilterProp='children'
              showSearch
              filterOption={false}
              onSearch={(value) => {
                setAccAccSearchFilter(value);
              }}
            >
              <Option key={0} value={0} disabled>{'Cuenta'}</Option>
              {
                (filterData(accAccountsData, accAccSearchFilter, ['name', 'num']) || []).map((element, index) => (
                  <Option
                    key={element.id}
                    value={element.id}
                    style={{ borderBottom: '1px solid #E5E5E5', backgroundColor: index % 2 === 0 ? '#f0f5ff' : '#ffffff' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: 0 }}>{element.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{element.num}</p>
                    </div>
                  </Option>
                ))
              }
            </Select>
            <Radio.Group
              options={([{id: 0, name: 'Todos'}, ...paymentMethodsData] || []).map((x) => ({ label: x.name, value: x.id }))}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
              }}
              value={paymentMethodFilter}
              optionType="button"
            />
            <Radio.Group
              options={([
                {
                  id: 1,
                  name: 'Todos'
                },
                {
                  id: 2,
                  name: 'Con IVA'
                },
                {
                  id: 3,
                  name: 'Sin IVA'
                }
              ] || []).map((x) => ({ label: x.name, value: x.id }))}
              onChange={(e) => {
                setShowIvaExpensesOption(e.target.value);
              }}
              value={showIvaExpensesOption}
              optionType="button"
              buttonStyle={{ color: 'red' }}
            />
            {/* <Checkbox onChange={(e) => {
              setShowWithoutIvaExpenses(e.target.checked);
            }}
            >
              No incluir IVA
            </Checkbox> */}
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                setPaymentMethodFilter(0);
                setExpenseTypeFilter(0);
                setMonthFilter(null);
                setExpenseAccAccountSelected(0);
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
            flexDirection: 'column',
            borderRadius: 10,
            backgroundColor: '#f5f5f5',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10
          }}
        >
          <p>Sumatorias de Gastos</p>
          <Space wrap>
            <StatCard icon="fas fa-solid fa-list" color="#1677ff" title="Gastos" value={dataToRender?.length} />
            <StatCard icon="fas fa-solid fa-list" color="#eb2f96" title="Gastos con IVA" value={statisticsData.expensesWithIva} />
            <StatCard icon="fas fa-solid fa-list" color="#13c2c2" title="Gastos sin IVA" value={statisticsData.expensesWithoutIva} />
          </Space>
          <div style={{ height: 10 }} />
          <Space wrap>
            <StatCard icon="fas fa-dollar-sign" color="#52c41a" title="Gravado" value={Number(statisticsData.expensesTotalTaxedAmount).toFixed(2)} />
            <StatCard icon="fas fa-dollar-sign" color="#52c41a" title="Exento" value={Number(statisticsData.expensesTotalNoTaxedAmount).toFixed(2)} />
            <StatCard icon="fas fa-dollar-sign" color="#52c41a" title="IVA" value={Number(statisticsData.expensesTotalIva).toFixed(2)} />
            <StatCard icon="fas fa-dollar-sign" color="#52c41a" title="Total" value={Number(statisticsData.expensesTotal).toFixed(2)} />
          </Space>
        </Col>
        <Col span={24}>
          <Table 
            columns={columns}
            rowKey={'expenseId'}
            size={'small'}
            dataSource={
              dataToRender
            }
            loading={fetching}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  setEntitySelectedId(record.expenseId);
                  setOpenPreview(true);
                }
              };
            }}
          />
        </Col>
      </Row>
      <ExpensePreview
        open={openPreview}
        expenseId={entitySelectedId}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) loadData();
        }}
      />
      {/* <OrderSaleForm
        open={openForm}
        orderSaleId={entitySelectedId}
        onRefresh={() => loadData()}
        onClose={() => setOpenForm(false)}
      /> */}
    </Wrapper>
  );
}

export default Expenses;

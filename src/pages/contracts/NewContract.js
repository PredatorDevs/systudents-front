import React, { useEffect, useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, DatePicker, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import customersServices from '../../services/CustomersServices';
import { CloseOutlined, DeleteOutlined, DollarTwoTone, HomeOutlined, ManOutlined, PhoneOutlined, SaveOutlined, WomanOutlined } from '@ant-design/icons';
import { filterData } from '../../utils/Filters';
import { forEach, isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import ProductSearchForSale from '../../components/ProductSearchForSale';
import { customNot } from '../../utils/Notifications';
import { columnActionsDef, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { GAddUserIcon, GEditUserIcon, GRefreshIcon } from '../../utils/IconImageProvider';
import CustomerForm from '../../components/forms/CustomerForm';
import contractsServices from '../../services/ContractsServices';
import { getUserId, getUserLocation } from '../../utils/LocalData';
import { validateArrayData, validateNumberData } from '../../utils/ValidateData';
import ContractBeneficiaries from '../../components/ContractBeneficiaries';

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

function NewContract() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [customerSearchFilter, setCustomerSearchFilter] = useState(false);
  const [productSearchFilter, setProductSearchFilter] = useState('');
  const [openProductSearchForSale, setOpenProductSearchForSale] = useState(false);
  const [openCustomerForm, setOpenCustomerForm] = useState(false);
  const [customerUpdateMode, setCustomerUpdateMode] = useState(false);
  const [resetContractBeneficiaries, setResetContractBeneficiaries] = useState(false);

  const [customersData, setCustomersData] = useState([]);
  const [customerSelectedData, setCustomerSelectedData] = useState([]);
  const [customerToUpdate, setCustomerToUpdate] = useState({});

  const [contractDatetime, setContractDatetime] = useState(defaultDate());
  const [customerSelected, setCustomerSelected] = useState(0);
  const [contractDetails, setContractDetails] = useState([]);
  const [contractDownPayment, setContractDownPayment] = useState(null);
  const [contractNumberOfPayments, setContractNumberOfPayments] = useState(null);
  const [contractPaymentValue, setContractPaymentValue] = useState(null);
  const [contractComments, setContractComments] = useState('');
  const [contractBeneficiaries, setContractBeneficiaries] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  function defaultDate() {
    return moment();
  };

  function restoreState() {
    setFetching(false);
    setCustomerSearchFilter(false);
    setProductSearchFilter('');
    setOpenProductSearchForSale(false);
    setOpenCustomerForm(false);
    setCustomerUpdateMode(false);
    setCustomerSelectedData([]);
    setCustomerToUpdate({});
    setContractDatetime(defaultDate());
    setCustomerSelected(0);
    setContractDetails([]);
    setContractDownPayment(null);
    setContractNumberOfPayments(null);
    setContractPaymentValue(null);
    setContractComments('');
    setContractBeneficiaries([]);

    setResetContractBeneficiaries(resetContractBeneficiaries + 1);
  }

  async function loadData() {
    try {
      setFetching(true);
      
      const cusRes = await customersServices.find();
      setCustomersData(cusRes.data);

      setFetching(false);
    } catch(err) {
      console.error(err);
      setFetching(false);
    }
  }

  async function getCustomerData(id) {
    try {
      setFetching(true);
      
      const cusRes = await customersServices.findById(id);
      console.log(cusRes.data);
      setCustomerSelectedData(cusRes.data);

      setFetching(false);
    } catch(err) {
      console.error(err);
      setFetching(false);
    }
  }

  function getQuantitySumProductDetail(productId) {
    let sum = 0;
    forEach(contractDetails, (x, index) => {
      sum += x.detailId === productId ? x.detailQuantity : 0;
    });
    return sum;
  }

  function getDetailTotal() {
    let total = 0;
    forEach(contractDetails, (value) => {
      total += (value.detailQuantity * value.detailUnitPrice)
    });
    return total || 0;
  }

  function pushDetail(data, downPay, numOfPay) {
    const newDetails = [ ...contractDetails, data ];

    setContractDetails(newDetails);

    let total = 0;
    forEach(newDetails, (value) => {
      total += (value.detailQuantity * value.detailUnitPrice)
    });

    setContractNumberOfPayments(
      (total - (+downPay || 0)) / (+numOfPay || 1)
      ||
      0
    )
  }

  function isValidDetail(element) {
    return (element.detailQuantity > 0) && (element.detailUnitPrice >= 0);
  }

  function validateData() {
    const validContractDatetime = contractDatetime !== null && contractDatetime.isValid();
    const validCustomerSelected = customerSelected !== 0 && customerSelected !== null;
    const validContractDetails = !isEmpty(contractDetails);
    const validContractDetailsIntegrity = contractDetails.every(isValidDetail);
    if (!validContractDatetime) customNot('warning', 'Debe seleccionar una fecha válida', 'Dato no válido');
    if (!validCustomerSelected) customNot('warning', 'Debe seleccionar un cliente', 'Dato no válido');
    if (!validContractDetails) customNot('warning', 'Debe añadir por lo menos un detalle de servicio/producto al contrato', 'Dato no válido');
    if (!validContractDetailsIntegrity) customNot('warning', 'Los datos en el detalle no son admitidos', 'Dato no válido');
    return (
      validContractDatetime && validCustomerSelected 
      && validContractDetails && validContractDetailsIntegrity 
      && validateNumberData(contractDownPayment, 'Debe especificar un monto de prima')
      && validateNumberData(contractNumberOfPayments, 'Debe especificar un numero de pagos')
      && validateArrayData(contractDetails, 1, 'Debe añadir por lo menos un detalle de servicio/producto al contrato')
    );
  }

  async function formAction() {
    if (validateData()) {
      try {
        setFetching(true);

        // START THE PROCESS OF SAVE THE SALE
        const contractRes = await contractsServices.add(
          getUserLocation(),
          customerSelected,
          1,
          contractDatetime.format('YYYY-MM-DD HH:mm:ss'),
          getDetailTotal(),
          contractDownPayment,
          contractNumberOfPayments,
          contractComments
        );
        
        const { insertId } = contractRes.data;

        if (!isEmpty(contractBeneficiaries)) {
          // EXPECTED req.body => details = [[ contractId, relationshipId, fullname, age, gender, address, createdBy, updatedBy ], [...]]
          const beneficiariesData = contractBeneficiaries.map((x) => ([
            insertId,
            x.beneficiaryRelationship,
            x.beneficiaryFullname,
            x.beneficiaryAge,
            x.beneficiaryGender,
            x.beneficiaryAddress,
            getUserId(),
            getUserId()
          ]));

          await contractsServices.beneficiaries.add(beneficiariesData);
        }

        // EXPECTED req.body => details = [[ contractId, productId, unitPrice, quantity, createdBy, updatedBy ], [...]]
        const contractDetailsData = contractDetails.map((element) => ([
          insertId,
          element.detailId,
          element.detailUnitPrice,
          element.detailQuantity,
          getUserId(),
          getUserId()
        ]));

        await contractsServices.details.add(contractDetailsData);

        setFetching(false);
        setResetContractBeneficiaries(resetContractBeneficiaries + 1);
        restoreState();
  
        window.scrollTo(0, 0);
      } catch(err) {
        console.log(err);
        setFetching(false);
      }
      
    }
  }

  const columns = [
    columnDef({title: 'Cantidad', dataKey: 'detailQuantity'}),
    columnDef({title: 'Detalle', dataKey: 'detailName'}),
    columnMoneyDef({title: 'Precio Unitario', dataKey: 'detailUnitPrice'}),
    columnMoneyDef({title: 'Total', dataKey: 'detailTaxableTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'GravadoNoTaxes', dataKey: 'detailTaxableWithoutTaxesTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'Taxes', dataKey: 'detailTotalTaxes', showDefaultString: true}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'uuid',
        detail: false,
        edit: false,
        del: true,
        delAction: (value) => {
          confirm({
            centered: true,
            title: '¿Desea eliminar este detalle?',
            icon: <DeleteOutlined />,
            content: 'Acción irreversible',
            okType: 'danger',
            onOk() { setContractDetails(contractDetails.filter((x) => x.uuid !== value)); },
            onCancel() { },
          });
        },
      }
    ),
  ];

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        
        <Col span={24}>
          <Space wrap>
            <Button
              loading={fetching}
              onClick={() => {
                loadData();
                getCustomerData(customerSelected);
              }}
            >
              <Space>
                <GRefreshIcon width={'16px'} />
                {'Refrescar'}
              </Space>
            </Button>
            <Button
              loading={fetching}
              onClick={() => setOpenCustomerForm(true)}
            >
              <Space>
                <GAddUserIcon width={'16px'} />
                {'Añadir cliente'}
              </Space>
            </Button>
            <Button
              loading={fetching}
              onClick={() => {
                setCustomerUpdateMode(true);
                setCustomerToUpdate(customerSelectedData);
                setOpenCustomerForm(true);
              }}
              disabled={!(customerSelected !== 0 && !isEmpty(customerSelectedData))}
            >
              <Space>
                <GEditUserIcon width={'16px'} />
                {'Editar cliente seleccionado'}
              </Space>
            </Button>
          </Space>
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>{'Seleccione un cliente:'}</p>
          <Select 
            id={'g-contract-customer-selector'}
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={customerSelected}
            loading={fetching}
            onChange={(value) => {
              setCustomerSelected(value);
              getCustomerData(value);
              setCustomerSearchFilter('');
              // document.getElementById('newsale-product-search-input').focus();
            }}
            optionFilterProp='children'
            showSearch
            filterOption={false}
            onSearch={(value) => {
              setCustomerSearchFilter(value);
            }}
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (filterData(customersData, customerSearchFilter, ['id', 'fullName', 'phone', 'address']) || []).map(
                (element) => (
                  <Option key={element.id} value={element.id} style={{ borderBottom: '1px solid #E5E5E5'}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <p style={{ margin: 0 }}>{element.fullName}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                      <Tag icon={<HomeOutlined />}>{`${element.address || '-'}`}</Tag>
                      <Tag icon={<PhoneOutlined />}>{`${element.phone || '-'}`}</Tag>
                    </div>
                  </Option>
                )
              )
            }
          </Select>
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>{'Fecha de contrato:'}</p>
          <DatePicker 
            id={'g-new-contract-datepicker'}
            locale={locale} 
            format="DD-MM-YYYY"
            value={contractDatetime} 
            style={{ width: '100%' }}
            onFocus={() => {
              document.getElementById('g-new-contract-datepicker').select();
            }}
            onChange={(datetimeMoment, datetimeString) => {
              setContractDatetime(datetimeMoment);
              // document.getElementById('g-customer-new-sale-selector').focus();
            }}
          />
        </Col>
        {
          customerSelected !== 0 && !isEmpty(customerSelectedData) ? <Col
            span={24}
            style={{
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
          >
            <Row gutter={[8, 8]} style={{ width: '100%', padding: 5 }}>
              <Col span={24}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Nombre del cliente'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.fullName}</p>
              </Col>
              <Col span={16}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Lugar de Nacimiento'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.birthplace || '-'}</p>
              </Col>
              <Col span={8}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Fecha de Nacimiento'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{moment(customerSelectedData[0][0]?.birthdate).format('LL') || '-'}</p>
              </Col>
              <Col span={6}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Edad'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.age || '-'}</p>
              </Col>
              <Col span={6}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Sexo'}</p>
                {
                  customerSelectedData[0][0]?.gender === 'M' ? <Tag icon={<ManOutlined />} color={'blue'}>Hombre</Tag>
                  : customerSelectedData[0][0]?.gender === 'F' ? <Tag icon={<WomanOutlined />} color={'pink'}>Mujer</Tag> :
                  <></>
                }
              </Col>
              <Col span={6}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'DUI:'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.dui || '-'}</p>
              </Col>
              <Col span={6}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Ocupación:'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.occupation || '-'}</p>
              </Col>
              <Col span={24}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Dirección:'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.address || '-'}</p>
              </Col>
              <Col span={16}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Teléfono:'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.defPhoneNumber || '-'}</p>
              </Col>
              <Col span={8}>
                <p style={{ margin: '0px', fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>{'Lugar de trabajo:'}</p>
                <p style={{ margin: '0px', fontSize: 14 }}>{customerSelectedData[0][0]?.jobAddress || '-'}</p>
              </Col>
            </Row>
          </Col> : <></>
        }
        <Col
          span={24}
          style={{
            backgroundColor: "#f9f0ff",
            boxShadow: '3px 3px 5px 0px #d9d9d9',
            border: '1px solid #d9d9d9',
            borderRadius: 5,
            padding: 5
          }}
        >
          <ContractBeneficiaries 
            onDataChange={(data) => setContractBeneficiaries(data)}
            setResetState={resetContractBeneficiaries}
            // focusToId={'customer-form-save-button'}
          />
        </Col>
        <Col
          span={24}
          style={{
            // backgroundColor: "#fafafa",
            // boxShadow: '3px 3px 5px 0px #d9d9d9',
            // border: '1px solid #d9d9d9',
            // borderRadius: 5
          }}
        >
          <Row gutter={[8, 8]} style={{ width: '100%', padding: 5 }}>
            <Col span={24}>
              <p style={{ margin: '0px', fontSize: 12 }}>{'Buscar servicio:'}</p>
              <Search
                id={'contract-product-search'}
                name={'productSearchFilter'} 
                value={productSearchFilter}
                placeholder="Código, Nombre"
                loading={fetching}
                allowClear
                // disabled={!(contractDetails.length < 18)}
                style={{ width: 300, marginBottom: 5 }}
                onChange={(e) => setProductSearchFilter(e.target.value)}
                onSearch={() => setOpenProductSearchForSale(true)}
                onKeyDown={
                  (e) => {
                    if (e.key === 'Enter')
                      setOpenProductSearchForSale(true);
                  }
                }
              />
            </Col>
          </Row>
        </Col>
        
        <Col span={24}>
          <Table 
            bordered
            loading={fetching}
            columns={columns}
            rowKey={'uuid'}
            size={'small'}
            dataSource={[
              ...contractDetails
            ] || []}
            pagination={false}
          />
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'TOTAL'}</p>}
              value={getDetailTotal() || 0}
              precision={2}
              prefix={<DollarTwoTone twoToneColor={'green'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
            title={'Prima'}
          >
            <InputNumber
              id='contract-down-payment'
              style={{ width: '100%' }} 
              placeholder={'100.00'}
              min={0}
              type={'number'} 
              value={contractDownPayment}
              onChange={(value) => setContractDownPayment(value)}
              onKeyDown={
                (e) => {
                  // if (e.key === 'Enter')
                    // document.getElementById('g-new-sale-datepicker').focus();
                }
              }
            />
          </Card>
        </Col>

        {/* <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
            title={'Núm. Pagos'}
          >
            <InputNumber 
              id='contract-number-of-payments'
              style={{ width: '100%' }} 
              placeholder={'12'}
              type={'number'} 
              min={0}
              value={contractNumberOfPayments} 
              onChange={(value) => setContractNumberOfPayments(value)}
              onKeyDown={
                (e) => {
                  // if (e.key === 'Enter')
                  //   document.getElementById('g-new-sale-datepicker').focus();
                }
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'CUOTA'}</p>}
              value={
                (getDetailTotal() - (+contractDownPayment || 0)) / (+contractNumberOfPayments || 1)
                ||
                0
              }
              precision={2}
              prefix={<DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col> */}
        
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
            title='Valor de Cuota'
            extra={[
              <DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />
            ]}
          >
            <InputNumber 
              id='contract-payment-value'
              style={{ width: '100%' }} 
              placeholder={'12'}
              type={'number'} 
              min={0}
              value={contractPaymentValue} 
              onChange={(value) => {
                setContractPaymentValue(value);
                setContractNumberOfPayments(
                  (getDetailTotal() - (+contractDownPayment || 0)) / (+value || 1)
                  ||
                  0
                )
              }}
              onKeyDown={
                (e) => {
                  // if (e.key === 'Enter')
                  //   document.getElementById('g-new-sale-datepicker').focus();
                }
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
            title='Numero de pagos'
            extra={[
              <DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />
            ]}
          >
            <InputNumber 
              id='contract-number-of-payments'
              style={{ width: '100%' }} 
              placeholder={'12'}
              type={'number'} 
              min={0}
              value={contractNumberOfPayments} 
              onChange={(value) => {
                setContractPaymentValue(
                  (getDetailTotal() - (+contractDownPayment || 0)) / (+value || 1)
                  ||
                  0
                );
                setContractNumberOfPayments(value)
              }}
              onKeyDown={
                (e) => {
                  // if (e.key === 'Enter')
                  //   document.getElementById('g-new-sale-datepicker').focus();
                }
              }
            />
          </Card>
        </Col>
        <Col span={24}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Observaciones:'}</p>
          <Input
            id={'contract-comments'}
            name={'contractComments'} 
            value={contractComments}
            placeholder=""
            onChange={(e) => setContractComments(e.target.value)}
            onKeyDown={
              (e) => {
                // if (e.key === 'Enter')
                //   setOpenProductSearchForSale(true);
              }
            }
          />
        </Col>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            type={'primary'}
            loading={fetching}
            icon={<SaveOutlined />}
            style={{ margin: 5 }}
            onClick={() => formAction()}
            disabled={fetching}
          >
            GENERAR CONTRATO
          </Button>
        </Col>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            // type={'primary'}
            loading={fetching}
            icon={<CloseOutlined />}
            danger
            style={{ margin: 5 }}
            onClick={() => navigate('/main/contracts')}
            disabled={fetching}
          >
            CANCELAR
          </Button>
        </Col>
      </Row>
      <ProductSearchForSale
        open={openProductSearchForSale} 
        productFilterSearch={productSearchFilter}
        onClose={(contractDetailToPush, executePush, currentStock) => { 
          setOpenProductSearchForSale(false);
          const { detailId, detailName, detailQuantity, detailIsService, detailSuggestedDownPayment, detailSuggestedPaymentValue } = contractDetailToPush;
          const currentDetailQuantity = getQuantitySumProductDetail(detailId);
          if (executePush) {
            if (!(currentStock < (currentDetailQuantity + detailQuantity)) || detailIsService) {
              setContractDownPayment(+detailSuggestedDownPayment);
              setContractPaymentValue(+detailSuggestedPaymentValue);
              pushDetail(contractDetailToPush, +detailSuggestedDownPayment, +detailSuggestedPaymentValue);
            } else {
              customNot(
                'error',
                `No puede añadir más ${detailName}`,
                `Solo hay ${currentStock} y ya ha añadido ${currentDetailQuantity} por lo que no se pueden añadir ${detailQuantity} más`
              );
            }
          }
          document.getElementById('newsale-product-search-input').focus();
          document.getElementById('newsale-product-search-input').select();
        }}
      />
      <CustomerForm 
        open={openCustomerForm} 
        updateMode={customerUpdateMode}
        dataToUpdate={customerToUpdate}
        showDeleteButton={false}
        onClose={(refresh, updatedId) => {
          setOpenCustomerForm(false);
          setCustomerUpdateMode(false);
          setCustomerToUpdate([]);
          if (refresh) { 
            document.getElementById('g-contract-customer-selector').focus();
            loadData();
            getCustomerData(updatedId);
          }
        }}
      />
    </Wrapper>
  );
}

export default NewContract;

import React, { useEffect, useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Col, InputNumber, Row, Select, Modal, Input, Button, DatePicker, Space, Radio, Checkbox } from 'antd';
import { customNot } from '../../utils/Notifications';
import { GAdd1Icon, GAddFileIcon, GAddUserIcon, GCardMethodIcon, GCashMethodIcon, GCashPaymentIcon, GClearIcon, GCreditNoteIcon, GCreditPaymentIcon, GDebitNoteIcon, GDispatchIcon, GEditUserIcon, GInvoice2Icon, GInvoiceTax2Icon, GPaymentCheckMethodIcon, GPetrol1Icon, GPetrol2Icon, GPetrol3Icon, GRefreshIcon, GSearchForIcon, GTicketIcon, GTransferMethodIcon } from '../../utils/IconImageProvider';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { DollarTwoTone, MinusCircleTwoTone, PlusCircleTwoTone, SaveOutlined } from '@ant-design/icons';
import { getUserId, getUserLocation } from '../../utils/LocalData';
import expensesServices from '../../services/ExpensesServices';
import generalsServices from '../../services/GeneralsServices';
import { filter } from 'lodash';
import { filterData } from '../../utils/Filters';

const { Option } = Select;
const { TextArea } = Input;

function NewExpense() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);

  const [accAccSearchFilter, setAccAccSearchFilter] = useState('');

  const [ableToUpload, setAbleToUpload] = useState(false);

  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [expenseTypesData, setExpenseTypesData] = useState([]);
  const [accAccountsData, setAccAccountsData] = useState([]);

  const [docNumber, setDocNumber] = useState('');
  const [docDatetime, setDocDatetime] = useState(defaultDate());
  const [documentTypeSelected, setDocumentTypeSelected] = useState(3);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState(1);
  const [expenseTypeSelected, setExpenseTypeSelected] = useState(1);
  const [accountCode, setAccountCode] = useState('');
  const [expenseAccAccountSelected, setExpenseAccAccountSelected] = useState(0);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(null);
  const [expenseTaxedAmount, setExpenseTaxedAmount] = useState(null);
  const [expenseNoTaxedAmount, setExpenseNoTaxedAmount] = useState(null);
  const [expenseDiscounts, setExpenseDiscounts] = useState(null);
  const [expenseBonus, setExpenseBonus] = useState(null);
  const [expenseIva, setExpenseIva] = useState(null);
  const [expenseFovial, setExpenseFovial] = useState(null);
  const [expenseCotrans, setExpenseCotrans] = useState(null);
  const [expenseIvaPerception, setExpenseIvaPerception] = useState(null);
  const [expenseIvaRetention, setExpenseIvaRetention] = useState(null);

  const [expenseAttachment, setExpenseAttachment] = useState(null);

  function defaultDate() {
    return moment();
  };
  
  async function loadData() {
    setFetching(true);
    try {
      const documentTypesResponse = await generalsServices.findDocumentTypes();
      const payMetRes = await generalsServices.findPaymentMethods();
      const expTypeRes = await expensesServices.findTypes();
      const accAccRes = await generalsServices.findAccountingAccounts();

      setDocumentTypesData(documentTypesResponse.data);
      setPaymentMethodsData(payMetRes.data);
      setExpenseTypesData(expTypeRes.data);
      setAccAccountsData(accAccRes.data);
    } catch(error) {

    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setExpenseAmount(
      (+expenseTaxedAmount || 0) +
      (+expenseNoTaxedAmount || 0) -
      (+expenseDiscounts || 0) -
      (+expenseBonus || 0) +
      (+expenseIva || 0) +
      (+expenseFovial || 0) +
      (+expenseCotrans || 0) +
      (+expenseIvaPerception || 0) -
      (+expenseIvaRetention || 0)
    );
  }, [
    expenseTaxedAmount,
    expenseNoTaxedAmount,
    expenseDiscounts,
    expenseBonus,
    expenseIva,
    expenseFovial,
    expenseCotrans,
    expenseIvaPerception,
    expenseIvaRetention
  ]);

  function restoreState() {
    setDocNumber('');
    setDocDatetime(defaultDate());
    setDocumentTypeSelected(3);
    setPaymentMethodSelected(1);
    setExpenseTypeSelected(1);
    setAccountCode('');
    setExpenseConcept('');
    setExpenseDescription('');
    setExpenseAmount(null);
    setExpenseTaxedAmount(null);
    setExpenseNoTaxedAmount(null);
    setExpenseDiscounts(null);
    setExpenseBonus(null);
    setExpenseIva(null);
    setExpenseFovial(null);
    setExpenseCotrans(null);
    setExpenseIvaPerception(null);
    setExpenseIvaRetention(null);
  }

  function validateData() {
    const validDocDatetime = docDatetime.isValid();
    const validDocumentAccountSelected = expenseAccAccountSelected !== 0 && expenseAccAccountSelected !== null;
    const validDocumentTypeSelected = documentTypeSelected !== 0 && documentTypeSelected !== null;
    const validExpenseTypeSelected = expenseTypeSelected !== 0 && expenseTypeSelected !== null;
    const validPaymentMethodSelected = paymentMethodSelected !== 0 && paymentMethodSelected !== null;
    const validExpenseConcept = expenseConcept !== '';
    const validExpenseAmount = expenseAmount >= 0;
    const validExpenseAttachment = ((expenseAttachment === null) || ((expenseAttachment !== null) && ableToUpload === true));
    if (!validDocDatetime) customNot('warning', 'Debe seleccionar una fecha válida', 'Dato no válido');
    if (!validDocumentAccountSelected) customNot('warning', 'Debe colocar una cuenta contable', 'Dato no válido');
    if (!validDocumentTypeSelected) customNot('warning', 'Debe seleccionar un tipo de documento', 'Dato no válido');
    if (!validExpenseTypeSelected) customNot('warning', 'Debe seleccionar un tipo de gasto', 'Dato no válido');
    if (!validPaymentMethodSelected) customNot('warning', 'Debe seleccionar un tipo de pago', 'Dato no válido');
    if (!validExpenseConcept) customNot('warning', 'Debe definir un concepto de gasto', 'Dato no válido');
    if (!validExpenseAmount) customNot('warning', 'Debe definir una monto de gasto', 'Dato no válido');
    if (!validExpenseAttachment) customNot('warning', 'Debe seleccionar un archivo con formato válido', 'Adjunto no válido');
    return (
      validDocDatetime && validDocumentTypeSelected && validExpenseTypeSelected && validPaymentMethodSelected && validExpenseConcept && validExpenseAmount && validExpenseAttachment
    );
  }

  async function formAction() {
    if (validateData()) {
      setFetching(true);
      try {
        await expensesServices.add(
          getUserLocation(),
          documentTypeSelected,
          expenseTypeSelected,
          paymentMethodSelected,
          docNumber,
          docDatetime.format('YYYY-MM-DD HH:mm:ss'),
          accountCode,
          expenseConcept,
          expenseDescription,
          expenseAmount,
          expenseTaxedAmount,
          expenseNoTaxedAmount,
          expenseDiscounts,
          expenseBonus,
          expenseIva,
          expenseFovial,
          expenseCotrans,
          expenseIvaRetention,
          expenseIvaPerception,
          getUserId(),
          expenseAccAccountSelected,
          expenseAttachment
        );
  
        navigate('/main/expenses/summary');
      } catch(error) {
        setFetching(false);
      }
    } else {

    }
  }

  function getDocumentTypeIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GTicketIcon width={size} />;
      case 2: return <GInvoice2Icon width={size} />;
      case 3: return <GInvoiceTax2Icon width={size} />;
      case 4: return <GCreditNoteIcon width={size} />;
      case 5: return <GDebitNoteIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

  function getPaymentMethodIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GCashMethodIcon width={size} />;
      case 2: return <GTransferMethodIcon width={size} />;
      case 3: return <GPaymentCheckMethodIcon width={size} />;
      case 4: return <GCardMethodIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Button
            onClick={() => loadData()}
          >
            Actualizar
          </Button>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Documento:'}</p>
          <Space wrap>
            <Radio.Group
              buttonStyle="solid"
              value={documentTypeSelected}
              onChange={(e) => {
                setDocumentTypeSelected(e.target.value);
              }}
            >
              {
                (filter(documentTypesData, ['enabledForExpenses', 1]) || []).map((element) => {
                  return (
                    <Radio.Button key={element.id} value={element.id}>
                      <Space>
                      {getDocumentTypeIcon(element.id, '16px')}
                      {element.name}
                      </Space>
                    </Radio.Button>
                  )
                })
              }
              
            </Radio.Group>
          </Space>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Metodo de pago:'}</p>
          <Radio.Group
            buttonStyle="solid"
            value={paymentMethodSelected}
            onChange={(e) => {
              setPaymentMethodSelected(e.target.value);
            }}
          >
            {
              (paymentMethodsData || []).map((element) => {
                return (
                  <Radio.Button key={element.id} value={element.id}>
                    <Space>
                    {getPaymentMethodIcon(element.id, '16px')}
                    {element.name}
                    </Space>
                  </Radio.Button>
                )
              })
            }
          </Radio.Group>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Fecha:'}</p>
          <DatePicker
            id={'g-new-parking-checkout-datepicker'}
            locale={locale}
            format="DD-MM-YYYY"
            // showTime
            value={docDatetime}
            style={{ width: '100%' }}
            onFocus={() => {
              document.getElementById('g-new-parking-checkout-datepicker').select();
            }}
            onChange={(datetimeMoment, datetimeString) => {
              setDocDatetime(datetimeMoment);
              document.getElementById('parkingcheckout-form-guard-selector').focus();
            }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>N° Documento:</p>
          <Input
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Cuenta Contable:</p>
          <Select 
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }}
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
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
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
        </Col>
        {/* <Col  span={12}> */}
          {/* <p style={{ margin: '0px', fontSize: 12 }}>Tipo:</p>
          <Select 
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={expenseTypeSelected} 
            onChange={(value) => {
              setExpenseTypeSelected(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (expenseTypesData || []).map((element, index) => (
                <Option key={element.id} value={element.id}>{element.name}</Option>
              ))
            }
          </Select> */}
        {/* </Col> */}
        {/* <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Cuenta contable:</p>
          <Input value={accountCode} onChange={(e) => setAccountCode(e.target.value)}/>
        </Col> */}
        <Col span={12}>
          <p style={{ margin: '0px', fontSize: 12 }}>En concepto de:</p>
          <Input value={expenseConcept} onChange={(e) => setExpenseConcept(e.target.value)}/>
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px', fontSize: 12 }}>Descripción:</p>
          <TextArea style={{ resize: 'none' }} rows={3} value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)}/>
        </Col>
        <Col span={24}>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Total Exento:</p>
          <InputNumber
            value={expenseNoTaxedAmount}
            onChange={(value) => setExpenseNoTaxedAmount(value)}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Total Gravado:</p>
          <InputNumber
            value={expenseTaxedAmount}
            onChange={(value) => {
              setExpenseTaxedAmount(value);
              setExpenseIva(Number(value * 0.13).toFixed(2));
            }}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Descuentos:</p>
          <InputNumber
            value={expenseDiscounts}
            onChange={(value) => setExpenseDiscounts(value)}
            addonBefore={<MinusCircleTwoTone twoToneColor={'#f5222d'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Bonificaciones:</p>
          <InputNumber
            value={expenseBonus}
            onChange={(value) => setExpenseBonus(value)}
            addonBefore={<MinusCircleTwoTone twoToneColor={'#f5222d'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>IVA:</p>
          <InputNumber
            value={expenseIva}
            onChange={(value) => setExpenseIva(value)}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%', marginBottom: 3 }}
          />
          <Checkbox onChange={(e) => {
            if (e.target.checked) setExpenseIva(0);
            else setExpenseIva(Number(expenseTaxedAmount * 0.13).toFixed(2));
              console.log(`checked = ${e.target.checked}`);
            }}
          >
            No incluir IVA
          </Checkbox>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Fovial:</p>
          <InputNumber
            value={expenseFovial}
            onChange={(value) => setExpenseFovial(value)}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Cotrans:</p>
          <InputNumber
            value={expenseCotrans}
            onChange={(value) => setExpenseCotrans(value)}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>IVA Percibido:</p>
          <InputNumber
            value={expenseIvaPerception}
            onChange={(value) => setExpenseIvaPerception(value)}
            addonBefore={<PlusCircleTwoTone twoToneColor={'#52c41a'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>IVA Retenido:</p>
          <InputNumber
            value={expenseIvaRetention}
            onChange={(value) => setExpenseIvaRetention(value)}
            addonBefore={<MinusCircleTwoTone twoToneColor={'#f5222d'} />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', fontSize: 12 }}>Monto total de operación:</p>
          <InputNumber
            value={expenseAmount}
            onChange={(value) => setExpenseAmount(value)}
            disabled
            addonBefore={<DollarTwoTone />}
            prefix={'$'}
            precision={2}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={24}>
        </Col>
        <Col span={8}>
          <Button 
            type={'primary'} 
            icon={<SaveOutlined />} 
            onClick={(e) => formAction()} 
            style={{ width: '100%' }} 
            loading={fetching}
            disabled={fetching}
          >
            Guardar
          </Button>
        </Col>
        <Col span={8}>
        </Col>
      </Row>
      {/* <Container>
        <Spin tip="Aplicando cambios" size="large" spinning={fetching}>
          <Row gutter={[16, 16]}>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 8 }} xl={{ span: 4 }} xxl={{ span: 4 }}>
              <p className={'form-label'}>N° Doc / Referencia:</p>
              <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)}/>
            </Col>
            <Col  xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 8 }} xl={{ span: 4 }} xxl={{ span: 4 }}>
              <p className={'form-label'}>Tipo:</p>
              <Select 
                dropdownStyle={{ width: '100%' }} 
                style={{ width: '100%' }} 
                value={expenseTypeSelected} 
                onChange={(value) => {
                  setExpenseTypeSelected(value);
                }}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (expenseTypesData || []).map((element, index) => (
                    <Option key={index} value={element.id}>{element.name}</Option>
                  ))
                }
              </Select>
            </Col>
            <Col  xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 8 }} xl={{ span: 4 }} xxl={{ span: 4 }}>
              <p className={'form-label'}>Pago:</p>
              <Select 
                dropdownStyle={{ width: '100%' }} 
                style={{ width: '100%' }}
                value={paymentMethodSelected}
                onChange={(value) => {
                  setPaymentMethodSelected(value);
                }}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (paymentMethodsData || []).map((element, index) => (
                    <Option key={index} value={element.id}>{element.name}</Option>
                  ))
                }
              </Select>
            </Col>
            <Col  xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
              <p className={'form-label'}>Cuenta:</p>
              <Input value={accountCode} onChange={(e) => setAccountCode(e.target.value)}/>
            </Col>
            <Col  xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 8 }} lg={{ span: 8 }} xl={{ span: 8 }} xxl={{ span: 8 }}>
              <p className={'form-label'}>Concepto:</p>
              <Input value={expenseConcept} onChange={(e) => setExpenseConcept(e.target.value)}/>
            </Col>
            <Col  xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 4 }} lg={{ span: 4 }} xl={{ span: 4 }} xxl={{ span: 4 }}>
              <p className={'form-label'}>Monto:</p>
              <InputNumber value={expenseAmount} onChange={(value) => setExpenseAmount(value)} prefix={'$'} precision={2} style={{ width: '100%' }} />
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
              <p className={'form-label'}>Descripción:</p>
              <TextArea style={{ resize: 'none' }} rows={3} value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)}/>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
              <p className={'form-label'}>Adjuntar:</p>
              <Space direction='vertical'>
                <Button icon={<UploadOutlined />} size={'large'} onClick={() => { document.getElementById('g-input-expense-file-uploader').click(); }}>
                  Seleccionar archivo
                </Button>
                <Tag>{`${expenseAttachment !== null ? expenseAttachment.name : ''}`}</Tag>
                <Button danger type={'primary'} icon={<DeleteOutlined />} size={'small'} style={{ display: expenseAttachment === null ? 'none' : 'inline' }} onClick={() => { setExpenseAttachment(null); customNot('warning', 'Archivo removido', 'Adjunto quitado'); }}>
                  Quitar
                </Button>
              </Space>
              <input
                type="file" 
                accept='.png, .jpg, .jpeg, .pdf, .xls, .xlsx, .doc, .docx'
                name="g-input-expense-file-uploader" 
                id="g-input-expense-file-uploader"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const [ file ] = e.target.files;
                  if (file !== undefined) {
                    setExpenseAttachment(file);
                    if (
                      verifyFileExtension(file.name, 'pdf') || 
                      verifyFileExtension(file.name, 'xls') ||
                      verifyFileExtension(file.name, 'xlsx') ||
                      verifyFileExtension(file.name, 'doc') ||
                      verifyFileExtension(file.name, 'docx') ||
                      verifyFileExtension(file.name, 'png') ||
                      verifyFileExtension(file.name, 'jpeg') ||
                      verifyFileExtension(file.name, 'jpg')
                    ) {
                      setAbleToUpload(true);
                      customNot('info', 'Archivo seleccionado', 'Adjunto válido');
                    } else {
                      setAbleToUpload(false);
                      customNot('warning', 'Debe seleccionar un archivo con formato válido', 'Adjunto no válido');
                    }
                  } else {
                    setExpenseAttachment(null);
                  }}
                }
              />
            </Col>
            <Col style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20 }} xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }} xl={{ span: 24 }} xxl={{ span: 24 }}>
              <Space>
                <Button size='large' onClick={(e) => navigate('/expenses')}>Cancelar</Button>
                <Button type='primary' onClick={(e) => formAction()} size='large' icon={<SaveOutlined />} disabled={fetching}>Guardar</Button>
              </Space>
            </Col>
          </Row>
        </Spin>
      </Container> */}
    </Wrapper>
  );
}

export default NewExpense;

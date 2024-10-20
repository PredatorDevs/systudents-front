import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, InputNumber, Alert, Radio, Space, Drawer, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import { customNot } from '../utils/Notifications.js';

import salesServices from '../services/SalesServices.js';
import { getUserLocation, getUserMyCashier } from '../utils/LocalData.js';
import generalsServices from '../services/GeneralsServices.js';
import { GAddFileIcon, GCardMethodIcon, GCashMethodIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GPaymentCheckMethodIcon, GTicketIcon, GTransferMethodIcon } from '../utils/IconImageProvider.js';
import { RequiredQuestionMark } from './RequiredQuestionMark.js';
import { validateSelectedData, validateStringData } from '../utils/ValidateData.js';
import customersServices from '../services/CustomersServices.js';

const { Option } = Select;

function NewGeneralSalePayment(props) {
  const [fetching, setFetching] = useState(false);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [banksData, setBanksData] = useState([]);
  const [openPaymentAdditionalInfoDrawer, setOpenPaymentAdditionalInfoDrawer] = useState(false);

  const [paymentMethodSelected, setPaymentMethodSelected] = useState(0);

  const [allowToProceed, setAllowToProceed] = useState(false);
  const [pendingAmountToPay, setPendingAmountToPay] = useState(0.00);
  const [amountToPaid, setAmountToPaid] = useState(null);

  // PAYMENT METHOD EXTRA INFO STATES
  const [bankSelected, setBankSelected] = useState(0);
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');

  const { open, customerId, onClose } = props;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPaymentDetailData();
  }, [ customerId ]);

  async function loadData() {
    setFetching(true);
    try {
      const payMetRes = await generalsServices.findPaymentMethods();
      const banksRes = await generalsServices.findBanks();
      setPaymentMethodsData(payMetRes.data);
      setBanksData(banksRes.data);
    } catch(error) {
      
    }
    setFetching(false);
  }

  async function loadPaymentDetailData() {
    if (customerId !== 0) {
      setFetching(true);
      try {
        const paymentDetRes = await customersServices.findTotalPendingAmountToPay(customerId);
        setPendingAmountToPay(paymentDetRes.data[0].totalPendingAmountToPay);
        setAllowToProceed(true);
      } catch(error) {
        setAllowToProceed(false);
      }
      setFetching(false);
    }
  }

  function validateData() {
    if ((paymentMethodSelected === 0 || paymentMethodSelected === null)) {
      customNot('warning', 'Debe definir un metodo de pago', 'Seleccione un método de pago');
      return false;
    }

    if (amountToPaid !== null) {
      if (amountToPaid <= pendingAmountToPay) {
        return true;
      } else {
        customNot('warning', 'Verifique cantidad de cobro', 'El cobro no puede ser mayor al saldo pendiente');
        return false;
      }
    } else {
      customNot('warning', 'Verifique cantidad de cobro', 'Ingrese un valor válido de cobro');
      return false;
    }
  }

  function formAction(fullPayment) {
    if (fullPayment) {
      if (validateData()) {
        salesServices.payments.addGeneral(
          customerId,
          pendingAmountToPay,
          getUserLocation(),
          getUserMyCashier(),
          paymentMethodSelected,
          bankSelected || null,
          paymentReferenceNumber || '',
          paymentAccountNumber || ''
        ).then((response) => {
          customNot('success', 'Cobro realizado', 'Acción exitosa');
          setAmountToPaid(null);
          // PAYMENT METHOD EXTRA INFO STATES
          setBankSelected(0);
          setPaymentReferenceNumber('');
          setPaymentAccountNumber('');
          setPaymentMethodSelected(0);
          loadPaymentDetailData();
          onClose(true);
        }).catch((error) => {
          customNot('error', 'Error de conexión', `Message: ${error.response.data.errorContent.sqlMessage || 'No info'}`);
        });
      }
    } else {
      if (validateData()) {
        salesServices.payments.addGeneral(
          customerId,
          amountToPaid,
          getUserLocation(),
          getUserMyCashier(),
          paymentMethodSelected,
          bankSelected || null,
          paymentReferenceNumber || '',
          paymentAccountNumber || ''
        ).then((response) => {
          customNot('success', 'Cobro realizado', 'Acción exitosa');
          setAmountToPaid(null);
          setBankSelected(0);
          setPaymentReferenceNumber('');
          setPaymentAccountNumber('');
          setPaymentMethodSelected(0);
          onClose(true);
        }).catch((error) => {
        customNot('error', 'Error de conexión', `Message: ${error.response.data.errorContent.sqlMessage || 'No info'}`);
        });
      }
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
    <Modal
      title={`Nuevo cobro general`}
      centered
      width={650}
      closable={false}
      maskClosable={false}
      open={open}
      footer={null}
    >      
      <Row gutter={8}>
        <Col span={24}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Metodo de pago:'}</p>
          <Radio.Group
            buttonStyle="solid"
            value={paymentMethodSelected}
            onChange={(e) => {
              setPaymentMethodSelected(e.target.value);
              setBankSelected(0);
              setPaymentReferenceNumber('');
              setPaymentAccountNumber('');
              if (e.target.value !== 1)
                setOpenPaymentAdditionalInfoDrawer(true);
              // setCustomerSelected(0);
              // loadDocumentInformation(e.target.value);
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
          {
            (paymentMethodSelected !== null && (paymentMethodSelected !== 0 && paymentMethodSelected !== 1)) ? <>
              <p style={{ margin: '0px', fontSize: 12 }}>{`No Referencia: ${paymentReferenceNumber}`}</p>
              <p style={{ margin: '0px', fontSize: 12 }}>{`No Cuenta: ${paymentAccountNumber}`}</p>
              <p style={{ margin: '0px', fontSize: 12 }}>{`Banco: ${banksData.find((x) => x.id === bankSelected)?.name}`}</p>
            </>
            : <></>
          }
        </Col>
        <Col span={24}>
          <div style={{ height: 10 }} />
        </Col>
        <Col span={11} style={{ backgroundColor: '#e6f7ff', borderRadius: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ margin: '10px', fontWeight: 600, fontSize: 18, color: '#0050b3' }}>Cobrar totalmente</p>
          <p style={{ margin: '0px', marginBottom: '10px', fontSize: 13, color: '#0050b3' }}>{`Cobro a efectuar de $${Number(pendingAmountToPay).toFixed(2)}`}</p>
          <Button type={'primary'} disabled={!allowToProceed} onClick={() => formAction(true)}>Proceder</Button>
          <p style={{ margin: '10px' }}>{''}</p>
        </Col>
        <Col span={2}>
          <Divider type='vertical' />
        </Col>
        <Col span={11} style={{ borderRadius: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ margin: '10px', fontWeight: 600, fontSize: 18, color: '#262626' }}>Monto a cobrar:</p>
          <InputNumber addonBefore={'$'} onChange={(value) => setAmountToPaid(value)} name={'amountToPaid'} value={amountToPaid} placeholder={'1.00'} style={{ marginBottom: '10px' }} />
          <Button disabled={!allowToProceed} onClick={() => formAction(false)}>Proceder</Button>
          <p style={{ margin: '10px' }}>{''}</p>
        </Col>
      </Row>
      {
        allowToProceed ? <></> : (
          <>
            <div style={{ marginTop: '10px' }} />
            <Alert message="Algo salió mal. El cobro no puede ser efectuado." type="error" showIcon />
          </>
        )
      }
      <div style={{ borderRadius: 5, marginTop: '10px', display: 'flex', flexDirection: 'row-reverse' }}>
        <Button type={'default'} danger onClick={() => onClose()}>Cancelar</Button>
      </div>
      <Drawer
        title={
          paymentMethodSelected === 2 ? 'Informacion de transferencia' :
            paymentMethodSelected === 3 ? 'Informacion de cheque' : ''
        }
        placement="right"
        onClose={() => {
          setOpenPaymentAdditionalInfoDrawer(false);
          setPaymentMethodSelected(0);
        }}
        maskClosable={false}
        open={openPaymentAdditionalInfoDrawer}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>{<RequiredQuestionMark />} No Referencia:</p>  
            <Input
              onChange={(e) => setPaymentReferenceNumber(e.target.value)}
              name={'paymentReferenceNumber'}
              value={paymentReferenceNumber}
            />
          </Col>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>No Cuenta:</p>  
            <Input
              onChange={(e) => setPaymentAccountNumber(e.target.value)}
              name={'paymentAccountNumber'}
              value={paymentAccountNumber}
            />
          </Col>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>{<RequiredQuestionMark />} Banco:</p>  
            <Select
              dropdownStyle={{ width: '100%' }} 
              style={{ width: '100%' }} 
              value={bankSelected} 
              onChange={(value) => setBankSelected(value)}
              optionFilterProp='children'
              showSearch
              filterOption={(input, option) =>
                (option.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
              {
                (banksData || []).map(
                  (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                )
              }
            </Select>
          </Col>
          <Col span={24}>
            <Button
              type={'primary'}
              icon={<SaveOutlined />}
              style={{ margin: 5, width: '100%' }}
              onClick={() => {
                if (
                  validateStringData(paymentReferenceNumber, 'Debe proporcionar un numero de referencia de la transaccion')
                  && validateSelectedData(bankSelected, 'Seleccione un banco')
                ) {
                  setOpenPaymentAdditionalInfoDrawer(false);
                }
              }}
              disabled={fetching}
            >
              GUARDAR
            </Button>
          </Col>
        </Row>
      </Drawer>
    </Modal>
  )
}

export default NewGeneralSalePayment;

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Card, Col, Collapse, Descriptions, List, Modal, PageHeader, Result, Row, Space, Statistic, Table, Tag } from 'antd';
import { ArrowDownOutlined, ArrowLeftOutlined, BackwardOutlined, BookOutlined, DollarOutlined, DollarTwoTone, DownSquareTwoTone, FileAddOutlined, FileProtectOutlined, LogoutOutlined, MinusCircleTwoTone, MoneyCollectOutlined, PlusCircleTwoTone, SyncOutlined, UpSquareTwoTone } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { Wrapper } from '../styled-components/Wrapper';

import cashiersServices from '../services/CashiersServices.js';
import moment from 'moment';
import 'moment/locale/es-mx';
import { getUserCanCloseCashier, getUserIsAdmin, getUserLocation, getUserMyCashier } from '../utils/LocalData';

import Meta from 'antd/lib/card/Meta';

import cashierIcon from '../img/icons/main/cashier.png'
import { isEmpty } from 'lodash';
import CashierInformationPreview from '../components/previews/CashierInfomationPreview';
import { columnDef, columnMoneyDef } from '../utils/ColumnsDefinitions';
import CloseCashierModal from '../components/CloseCashierModal';
import OpenCashierModal from '../components/OpenCashierModal';
import NewCashierCashFundDeposit from '../components/forms/NewCashierCashFundDeposit.js';
import NewCashierCashFundWithdraw from '../components/forms/NewCashierCashFundWithdraw.js';
import { GCashMethodIcon } from '../utils/IconImageProvider.js';

const { Panel } = Collapse;

function MyCashier() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showBackButton1, setShowBackButton1] = useState(false);

  const [fetching, setFetching] = useState(false);
  const [openCashierInfoPrev, setOpenCashierInfoPrev] = useState(false);
  const [openNewCashierCashFundDeposit, setOpenNewCashierCashFundDeposit] = useState(false);
  const [openNewCashierCashFundWithdraw, setOpenNewCashierCashFundWithdraw] = useState(false);
  const [openCloseCashier, setOpenCloseCashier] = useState(false);
  const [openOpenCashier, setOpenOpenCashier] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [movementsData, setMovementsData] = useState([]);
  const [gasStationSummary, setGasStationSummary] = useState([]);
  const [entityDataSelected, setEntityDataSelected] = useState({});

  async function loadData() {
    setFetching(true);
    try {
      let response;

      if (state !== null) {
        const { cashierId } = state;
        response = await cashiersServices.findMyCashier(cashierId);
        setShowBackButton1(true);
      } else {
        response = await cashiersServices.findMyCashier(getUserMyCashier());
      }
      
      setEntityData(response.data);
  
      if (response.data[0].isOpen) {
        const summaryResponse = await cashiersServices.getCurrentShiftcutSummary(response.data[0].currentShiftcutId);
        const reportResponse = await cashiersServices.getCurrentShiftcutReport(response.data[0].currentShiftcutId);
        const paymentsResponse = await cashiersServices.getCurrentShiftcutPayments(response.data[0].currentShiftcutId);
        const movementsResponse = await cashiersServices.getCurrentShiftcutCashFundMovements(response.data[0].currentShiftcutId);
        const gasStationSummaryResponse = await cashiersServices.getCurrentShiftcutGasStationSummary(response.data[0].currentShiftcutId);

        setSummaryData(summaryResponse.data);
        setReportData(reportResponse.data);
        setPaymentsData(paymentsResponse.data);
        setMovementsData(movementsResponse.data);
        setGasStationSummary(gasStationSummaryResponse.data);
      }
    } catch (error) {
      console.log(error);
    }

    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getReportTotalCash() {
    if (isEmpty(reportData)) return 0
    else {
      let value = 0;
      for (let i = 0; i < reportData.length; i++) {
        const { saleId, cashSale } = reportData[i];
        if (saleId !== null) value += +(cashSale);
      }
      return value;
    }
  }

  function getReportTotalCredit() {
    if (isEmpty(reportData)) return 0
    else {
      let value = 0;
      for (let i = 0; i < reportData.length; i++) {
        const { saleId, creditSale } = reportData[i];
        if (saleId !== null) value += +(creditSale);
      }
      return value;
    }
  }

  function getReportTotalSale() {
    if (isEmpty(reportData)) return 0
    else {
      let value = 0;
      for (let i = 0; i < reportData.length; i++) {
        const { saleId, totalSale } = reportData[i];
        if (saleId !== null) value += +(totalSale);
      }
      return value;
    }
  }

  function getTotalCashFromSummary() {
    return isEmpty(summaryData) ? 
      0 : 
      +(summaryData[0].totalAmount || 0) + // Efectivo Inicial
      +(summaryData[1].totalAmount || 0) + // Contado - Efectivo
      +(summaryData[5].totalAmount || 0)  // Abonos - Efectivo
  }

  function getTotalCashFromSummaryToRemit() {
    return isEmpty(summaryData) ? 
      0 : 
      // +(summaryData[0].totalAmount || 0) + 
      +(summaryData[1].totalAmount || 0) +
      +(summaryData[5].totalAmount || 0)
  }

  function getCashInCashier() {
    return (
      isEmpty(entityData) && isEmpty(summaryData) ?
        0 :
        (getTotalCashFromSummary()) + +(entityData[0].cashFunds || 0)
    )
  }

  return (
    <Wrapper>
      {
        isEmpty(entityData) ? <>
          <Result
            status="warning"
            title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Información de caja no disponible"}`}</p>}
            subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Vuelva a intentar más tarde"}`}</p>}
          />
        </> : <>
          <Row gutter={[8, 8]} style={{ width: '100%' }}>
            <Col span={24} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Space wrap>
                <Button
                  size='large'
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    navigate('/main/administration/cashiers');
                  }}
                  disabled={!getUserIsAdmin()}
                  loading={fetching}
                  style={{ display: showBackButton1 ? 'inline' : 'none' }}
                >
                  Volver a cajas
                </Button>
                <Button
                  size='large'
                  icon={<SyncOutlined />}
                  onClick={() => {
                    loadData();
                  }}
                  loading={fetching}
                >
                  Actualizar
                </Button>
                <Button
                  size='large'
                  // style={{ backgroundColor: '#722ed1', color: 'white' }}
                  icon={<MinusCircleTwoTone twoToneColor={'red'} />}
                  disabled={!entityData[0]?.enableReportCashFundMovements}
                  loading={fetching}
                  onClick={() => {
                    setEntityDataSelected(entityData[0]);
                    setOpenNewCashierCashFundWithdraw(true);
                  }}
                >
                  Retiro Caja Chica
                </Button>
                <Button
                  size='large'
                  // style={{ backgroundColor: '#2f54eb', color: 'white' }}
                  icon={<PlusCircleTwoTone />}
                  loading={fetching}
                  disabled={!entityData[0]?.enableReportCashFundMovements}
                  onClick={() => {
                    setEntityDataSelected(entityData[0]);
                    setOpenNewCashierCashFundDeposit(true);
                  }}
                >
                  Reposición Caja Chica
                </Button>
              </Space>
            </Col>
            <Col span={12}>
              <Card
                style={{
                  width: 300,
                  margin: 10,
                  backgroundColor: entityData[0].isOpen ? "#d9f7be" : "#fafafa",
                  boxShadow: '3px 3px 5px 0px #d9d9d9',
                  border: '1px solid #d9d9d9'
                }}
                loading={fetching}
                actions={[
                  <Button
                    key="1"
                    onClick={() => {
                      setEntityDataSelected(entityData[0]);
                      setOpenCashierInfoPrev(true);
                    }}
                    loading={fetching}
                  >
                    Informacion
                  </Button>,
                  <Button
                    key="2"
                    type={'primary'}
                    disabled={(!(!getUserCanCloseCashier() || getUserIsAdmin()))}
                    onClick={() => {
                      if (entityData[0].isOpen) {
                        setOpenCloseCashier(true);
                      } else {
                        setOpenOpenCashier(true);
                      }
                    }}
                    loading={fetching}
                  >
                    {
                      entityData[0].isOpen ? 'Cerrar caja' : 'Aperturar caja'
                    }
                  </Button>,
                ]}
              >
                <Meta
                  avatar={<Avatar src={cashierIcon} shape='square' />}
                  title={entityData[0].name}
                  description={
                    <>
                      <p style={{ margin: 0 }}>{`${entityData[0].isOpen ? `Caja abierta - Turno #${entityData[0].currentShiftcutNumber}` : "Caja cerrada"}`}</p>
                      <p style={{ margin: '5px 0px 0px 0px', fontSize: 11 }}>{entityData[0].locationName}</p>
                      <p style={{ margin: '5px 0px 0px 0px', fontSize: 9 }}>{`CId: ${entityData[0].id} - SId: ${entityData[0].currentShiftcutId || ''}`}</p>
                    </>
                  }
                />
              </Card>
            </Col>
            {/* <Col span={12}>
              
            </Col> */}
            {
              entityData[0].isOpen ? <Col span={12} style={{ backgroundColor: '#FAFAFA' }}>
                <Descriptions
                  bordered
                  labelStyle={{ fontSize: 11, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
                  contentStyle={{ fontSize: 13, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
                  style={{ width: '100%' }}
                  size={'small'}
                >
                  <Descriptions.Item label={`Fondo Caja Chica`} span={3}>{Number(entityData[0].cashFunds || 0).toFixed(2)}</Descriptions.Item>
                  {
                    summaryData.map((element, index) => (
                    <Descriptions.Item key={index} label={`${element.movementType}`} span={3}>{Number(element.totalAmount || 0).toFixed(2)}</Descriptions.Item>
                    ))
                  }
                  <Descriptions.Item label={`Total Efectivo En Caja`} span={3}>{Number(getTotalCashFromSummary() || 0).toFixed(2)}</Descriptions.Item>
                  <Descriptions.Item label={`Efectivo a entregar`} span={3}>{Number(getTotalCashFromSummaryToRemit() || 0).toFixed(2)}</Descriptions.Item>
                </Descriptions>
              </Col>
              : <></>
            }
            {
              entityData[0].isOpen ? <Col span={24} style={{ backgroundColor: '#FAFAFA' }}>
                <Collapse>
                  <Panel header="Resumen Pista" key="5">
                    <Table 
                      columns={[
                        columnDef({title: 'Descripcion', dataKey: 'productName'}),
                        columnDef({title: 'Cantidad', dataKey: 'totalQuantity', align: 'right'}),
                        columnMoneyDef({title: 'Prec. Uni.', dataKey: 'unitPrice', precision: 4}),
                        columnMoneyDef({title: 'Venta Total', dataKey: 'totalSale', precision: 4}),
                        columnMoneyDef({title: 'IVA', dataKey: 'totalIva', precision: 4}),
                        columnMoneyDef({title: 'FOVIAL', dataKey: 'totalFovial', precision: 4}),
                        columnMoneyDef({title: 'COTRANS', dataKey: 'totalCotrans', precision: 4}),
                      ]}
                      scroll={{ y: 300 }}
                      rowKey={'productId'}
                      size={'small'}
                      dataSource={gasStationSummary || []}
                      pagination={false}
                      loading={fetching}
                      onRow={(record, index) => ({
                        style: {
                            background: record.productCode === '' ? '#f0f5ff' : record.productCode === 'TGENERAL' ? '#d9f7be' : 'inherit',
                            fontWeight: record.productCode === '' ? 600 : record.productCode === 'TGENERAL' ? 600 : 'inherit',
                            
                            // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
                        }
                      })}
                    />
                  </Panel>
                  <Panel header="Ventas" key="1">
                    <Table 
                      columns={[
                        columnDef({title: 'Documento', dataKey: 'document'}),
                        columnDef({title: 'Tipo', dataKey: 'paymentTypeName'}),
                        columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
                        columnDef({title: 'Descripción', dataKey: 'productName'}),
                        // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
                        // columnMoneyDef({title: 'Contado', dataKey: 'cashSale'}),
                        // columnMoneyDef({title: 'Crédito', dataKey: 'creditSale'}),
                        columnMoneyDef({title: 'Monto', dataKey: 'totalSale'}),
                      ]}
                      scroll={{ y: 300 }}
                      rowKey={'id'}
                      size={'small'}
                      dataSource={
                        [
                          ...reportData,
                          {
                            dataKey: null,
                            customerFullname: null,
                            productName: "TOTAL",
                            cashSale: getReportTotalCash(),
                            creditSale: getReportTotalCredit(),
                            totalSale: getReportTotalSale()
                          }
                        ] || []
                      }
                      pagination={true}
                      loading={fetching}
                      onRow={(record, index) => ({
                        style: {
                            background: record.isHeader === 1 && record.isFooter === 0 ? '#adc6ff' : record.isHeader === 0 && record.isFooter === 1 ? '#f0f5ff' : index % 2 === 0 ? '#f0f5ff' :  'inherit',
                            // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
                        }
                      })}
                    />
                  </Panel>
                  <Panel header="Abonos" key="2">
                    <Table 
                      columns={[
                        columnDef({title: 'Registrado por', dataKey: 'registeredByFullname'}),
                        columnDef({title: 'Documento', dataKey: 'document'}),
                        columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
                        // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
                        columnMoneyDef({title: 'Monto', dataKey: 'totalPaid'}),
                      ]}
                      scroll={{ y: 300 }}
                      rowKey={'paymentId'}
                      size={'small'}
                      dataSource={paymentsData || []}
                      pagination={true}
                      loading={fetching}
                      onRow={(record, index) => ({
                        style: {
                            background: index % 2 === 0 ? '#f0f5ff' :  'inherit',
                            // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
                        }
                      })}
                    />
                  </Panel>
                  <Panel header="Movimientos Caja Chica" key="3">
                    <Table 
                      columns={[
                        columnDef({title: 'Operacion', dataKey: 'movementTypeName'}),
                        columnDef({title: 'Por', dataKey: 'userPINCodeFullname'}),
                        columnDef({title: 'Razon', dataKey: 'comments'}),
                        // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
                        columnMoneyDef({title: 'Anterior', dataKey: 'prevAmount'}),
                        columnMoneyDef({title: 'Monto', dataKey: 'amount'}),
                        columnMoneyDef({title: 'Saldo', dataKey: 'newAmount'})
                      ]}
                      scroll={{ y: 300 }}
                      rowKey={'shiftcutCashFundMovementId'}
                      size={'small'}
                      dataSource={movementsData || []}
                      pagination={true}
                      loading={fetching}
                      onRow={(record, index) => ({
                        style: {
                            background: record.movementType === 'deposit' ? '#EEF7FF' :  '#FFF5F5',
                            // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
                        }
                      })}
                    />
                  </Panel>
                </Collapse>
              </Col>
              : <></>
            }
            {
              entityData[0].isOpen ?
              <CloseCashierModal
                open={openCloseCashier}
                cashierId={entityData[0].id}
                finalAmount={getCashInCashier() || 0}
                cashFunds={Number(entityData[0]?.cashFunds)}
                onClose={(refresh) => {
                  setOpenCloseCashier(false);
                  if (refresh) loadData();
                }}
              />
              : <></>
            }
            {
              !entityData[0].isOpen ?
              <OpenCashierModal
                open={openOpenCashier}
                cashierId={entityData[0].id}
                onClose={(refresh) => {
                  setOpenOpenCashier(false);
                  if (refresh) loadData();
                }}
              />
              : <></>
            }
          </Row>
        </>
      }
      <CashierInformationPreview
        open={openCashierInfoPrev}
        cashierData={entityDataSelected || {}}
        onClose={() => {
          setEntityDataSelected({});
          setOpenCashierInfoPrev(false);
        }}
      />
      <NewCashierCashFundDeposit
        open={openNewCashierCashFundDeposit}
        cashierId={entityDataSelected?.id || {}}
        onClose={(refresh) => {
          if (refresh) loadData();
          setEntityDataSelected({});
          setOpenNewCashierCashFundDeposit(false);
        }}
      />
      <NewCashierCashFundWithdraw
        open={openNewCashierCashFundWithdraw}
        cashierId={entityDataSelected?.id || {}}
        onClose={(refresh) => {
          if (refresh) loadData();
          setEntityDataSelected({});
          setOpenNewCashierCashFundWithdraw(false);
        }}
      />
    </Wrapper>
  );
}

export default MyCashier;

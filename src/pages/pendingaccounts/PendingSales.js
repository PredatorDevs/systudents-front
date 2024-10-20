import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Input,
  List,
  Modal,
  PageHeader,
  Radio,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag
} from 'antd';
import { EyeTwoTone, FileExcelFilled, FileExcelTwoTone, FilePdfTwoTone, FileProtectOutlined, FileTwoTone, LogoutOutlined, MoneyCollectOutlined, MoneyCollectTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Wrapper } from '../../styled-components/Wrapper';

import { customNot } from '../../utils/Notifications';
import styled from 'styled-components';
import cashiersServices from '../../services/CashiersServices.js';
import { isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import ClosingShiftcutModal from '../../components/ClosingShiftcutModal.js';
import { TableContainer } from '../../styled-components/TableContainer.js';
import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import salesServices from '../../services/SalesServices';
import customersServices from '../../services/CustomersServices';
import NewSalePayment from '../../components/NewSalePayment';
import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';

import personIcon from '../../img/icons/person2.png';
import invoiceIcon from '../../img/icons/invoice.png';
import invoiceTaxIcon from '../../img/icons/invoicetax.png';
import { GBooksIcon, GPdfFileIcon, GPendingAccountsIcon, GRefreshIcon } from '../../utils/IconImageProvider';
import { filterData } from '../../utils/Filters.js';
import NewGeneralSalePayment from '../../components/NewGeneralSalePayment.js';
import SalePreview from '../../components/previews/SalePreview.js';
import reportsServices from '../../services/ReportsServices.js';
import download from 'downloadjs';

const { confirm } = Modal;
const { Search } = Input;

function PendingSales() {
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');

  const [pendingAccountsFilter, setPendingAccountsFilter] = useState(0);

  const [ableToProcess, setIsAbleToProcess] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [openModalGeneral, setOpenModalGeneral] = useState(false);
  const [openSalePreviewModal, setOpenSalePreviewModal] = useState(false);
  const [saleSelectedId, setSaleSelectedId] = useState(0);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [entityDataFiltered, setEntityDataFiltered] = useState({});
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [entityRefreshData, setEntityRefreshData] = useState(0);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  const [customerSelectedToPay, setCustomerSelectedToPay] = useState(0);

  const [saleSelectedToPay, setSaleSelectedToPay] = useState(0);
  const [saleDocNumberSelected, setSaleDocNumberSelected] = useState(0);

  const navigate = useNavigate();

  async function checkIfAbleToProcess() {
    setFetching(true);
    
    try {
      const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());
      const { isOpen, currentShiftcutId } = response.data[0];
      
      if (isOpen === 1 && currentShiftcutId !== null) {
        setIsAbleToProcess(true);
      }
    } catch(error) {

    }

    setFetching(false);
  }
  
  async function loadData() {
    setFetching(true);
    
    try {
      const pendingRes = await salesServices.findPendingsByLocation(getUserLocation());
      setEntityData(pendingRes.data);
    } catch(error) {

    }

    setFetching(false);
  }

  async function loadDetailData(customerId) {
    setFetching(true);

    try {
      const cusPendingRes = await customersServices.findPendingSales(customerId || 0);
      setEntitySelectedId(customerId);
      setEntityDetailData(cusPendingRes.data);
      setEntityDataFiltered(entityData.find((x) => x.customerId === customerId) || {});
    } catch(error) {

    }

    setFetching(false);
  }

  useEffect(() => {
    checkIfAbleToProcess();
    loadData();
  }, []);

  function getDocumentTypeIcon(type, size = '36px') {
    switch(type) {
      case 0: return <GBooksIcon width={size} />;
      case 1: return <GPendingAccountsIcon width={size} />;
      default: return <GBooksIcon width={size} />;
    }
  }

  function getPendingAccountsByFilter() {
    if (pendingAccountsFilter !== 0) {
      return entityData.filter((x) => (
        // Si tipo doc Factura y tipo pago Contado traer Clientes = todos
        (pendingAccountsFilter === 1 && +x.expiredSales > 0)
      ));
    } else {
      return entityData || [];
    }
  }

  async function fetchExcelReport() {
    setFetching(true);
    try {
      const res = await reportsServices.excel.getPendingSales();
      download(res.data, `ReporteSaldosPendientesClientes.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  return (
    !ableToProcess ? <>
      <Result
        status="info"
        title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de cobro limitadas"}`}</p>}
        subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
      />
    </> : <Wrapper xCenter>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col
          span={24}
          style={{
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: '#e6f4ff',
            borderRadius: '5px'
          }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Opciones:'}</p>
          <Space wrap>
            {/* <Button
              // type='primary'
              icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
              onClick={() => {loadData(); loadDetailData(entitySelectedId);}}
            >
              {'Saldos Pendientes'}
            </Button>
            <Button
              // type='primary'
              icon={<FilePdfTwoTone twoToneColor={'#f5222d'} />}
              onClick={() => {loadData(); loadDetailData(entitySelectedId);}}
            >
              {'Saldos Pendientes'}
            </Button> */}
            <Dropdown
              menu={{
                items: [
                  {
                    label: 'PDF',
                    key: '1',
                    icon: <FilePdfTwoTone twoToneColor={'#f5222d'} />,
                    onClick: (e) => {
                      customNot('info', 'En proceso de desarrollo...', 'Intente más tarde')
                    }
                  },
                  {
                    label: 'EXCEL',
                    key: '2',
                    icon: <FileExcelTwoTone twoToneColor={'#52c41a'} />,
                    onClick: (e) => {
                      fetchExcelReport();
                    }
                  }
                ]
              }}
              placement="bottomLeft"
            >
              <Button icon={<FileTwoTone twoToneColor={'#1677ff'} />} loading={fetching} onClick={(e) => {e.stopPropagation()}}>
                Saldos Pendientes
              </Button>
            </Dropdown>
            <Button
              // type='primary'
              onClick={() => {loadData(); loadDetailData(entitySelectedId);}}
            >
              <Space>
                <GRefreshIcon width={'16px'} />
                {'Actualizar'}
              </Space>
            </Button>
          </Space>
        </Col>
        <Col span={8}>
          <Radio.Group
            buttonStyle="solid"
            value={pendingAccountsFilter}
            onChange={(e) => {
              setPendingAccountsFilter(e.target.value);
            }}
          >
            {
              ([
                { id: 0, name: 'Todas' },
                { id: 1, name: 'Vencidas' }
              ]).map((element) => {
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
          <p style={{ margin: 0, fontSize: 12 }}>Nombre de cliente:</p>
          <Search
            name={'filter'}
            value={filter} 
            placeholder="Juan" 
            allowClear 
            style={{ width: '100%', marginBottom: 5 }}
            onChange={(e) => setFilter(e.target.value)}
            size={'large'}
          />
          {/* <p style={{ fontWeight: 600, fontSize: 20 }}>Clientes pendientes</p> */}
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={filterData(getPendingAccountsByFilter(), filter, ['customerFullname', 'businessName']) || [] || []}
            pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '20', '50']}}
            renderItem={item => (
              <List.Item
                onClick={() => {
                  loadDetailData(item.customerId);
                  setCustomerSelectedToPay(item.customerId);
                }}
                style={{
                  backgroundColor: item.customerId === entitySelectedId ? '#d9d9d9' : 'transparent',
                  borderLeft: `5px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderBottom: `5px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderRight: `1px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderTop: `1px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  marginBottom: `5px`,
                  borderRadius: 10
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar src={personIcon} style={{ backgroundColor: 'transparent' }} />}
                  title={<p style={{ margin: 0 }}>{item.customerFullname}</p>}
                  description={
                    <>
                      <p style={{ margin: 0, fontSize: 9, fontStyle: 'italic' }}>{`${item.businessName || ''}`}</p>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>{`Deuda total: $${+item.totalAmountPending || 0}`}</p>
                      <p style={{ margin: 0, fontSize: 10 }}>{`${item.pendingSales} ${item.pendingSales > 1 ? 'cuentas pendientes' : 'cuenta pendiente'}`}</p>
                      {
                        +(item.expiredSales) > 0 ?
                          <p style={{ margin: 0, fontSize: 10, color: 'red' }}>{`${item.expiredSales} ${item.expiredSales > 1 ? 'vencidas' : 'vencida'}`}</p> :
                          <></>
                      }
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
        <Col span={16} style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}>
          <p style={{ fontSize: 14, margin: '5px 0px 0px 0px', fontWeight: 600 }}>
            {`${entityDataFiltered?.customerFullname || ''}`}
          </p>
          <p style={{ fontSize: 10, margin: '0px 0px 5px 0px', fontStyle: 'italic' }}>
            {`Cliente seleccionado`}
          </p>
          <Button
            onClick={() => { 
              setOpenModalGeneral(true);
            }}
            style={{ display: customerSelectedToPay !== 0 ? 'inline' : 'none' }}
          >
            Cobro general
          </Button>
          
          {/* {
            entitySelectedId !== 0 ? (
              <Button
                style={{ margin: '3px 10px' }}
              >
                Nuevo Abono General
              </Button>
            ) : <></>
          } */}
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={entityDetailData || []}
            loading={fetching}
            renderItem={(item, index) => (
              <List.Item
                style={{
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#F0F2F5',
                  borderLeft: '5px solid #bae0ff',
                  borderBottom: '5px solid #bae0ff',
                  borderRight: '1px solid #bae0ff',
                  borderTop: '1px solid #bae0ff',
                  marginBottom: '5px',
                  borderRadius: 10
                }}
                extra={[
                  <Button
                    onClick={() => {
                      setSaleSelectedId(item.saleId);
                      setOpenSalePreviewModal(true);
                    }}
                    icon={<EyeTwoTone />}
                  >
                    Ver
                  </Button>,
                  <div style={{ width: 10 }} />,
                  <Button
                    onClick={() => { 
                      setSaleSelectedToPay(item.saleId);
                      setSaleDocNumberSelected(item.docNumber);
                      setOpenModal(true);
                    }}
                    icon={<MoneyCollectTwoTone twoToneColor={'green'} />}
                  >
                    Cobrar
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={item.documentTypeId === 3 ? invoiceTaxIcon : invoiceIcon} 
                    />
                  }
                  title={
                    <>
                      <p 
                        style={{ margin: '0px' }}
                      >
                        {`${item.documentTypeName} ${item.docNumber} ${item.paymentTypeId === 3 ? '- Venta En Ruta' : ''}`}
                      </p>
                      <p 
                        style={{ margin: '0px', fontSize: 10, color: +(item.expiresIn) > 0 ? 'black' : 'red' }}
                      >
                        {`${item.expirationInformation || ''}`}
                      </p>
                    </>
                  }
                  description={
                    <Space wrap>
                      <p style={{ margin: 0 }}>{`Debe `}<Tag color={'red'}>{`$ ${item.salePendingAmount}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Pagado `}<Tag color={'green'}>{`$ ${item.saleTotalPaid}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Total `}<Tag>{`$ ${item.saleTotal}`}</Tag></p>
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination
          />
        </Col>
      </Row>
      <NewSalePayment 
        open={openModal}
        saleId={saleSelectedToPay}
        docNumber={saleDocNumberSelected}
        onClose={(success) => {
          setOpenModal(false);
          if (success) {
            loadData();
            loadDetailData(entitySelectedId);
            setSaleSelectedToPay(0);
          }
        }}
      />
      <NewGeneralSalePayment 
        open={openModalGeneral}
        customerId={customerSelectedToPay}
        onClose={(success) => {
          setOpenModalGeneral(false);
          if (success) {
            loadData();
            loadDetailData(entitySelectedId);
            // setCustomerSelectedToPay(0);
          }
        }}
      />
      <SalePreview
        open={openSalePreviewModal}
        saleId={saleSelectedId}
        allowActions={false}
        onClose={(wasVoided) => {
          setOpenSalePreviewModal(false);
          setSaleSelectedId(0);
          if (wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default PendingSales;

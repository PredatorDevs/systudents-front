import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Col, Dropdown, Input, List, Modal, PageHeader, Radio, Result, Row, Space, Spin, Statistic, Table, Tag } from 'antd';
import { EyeTwoTone, FileExcelTwoTone, FilePdfTwoTone, FileProtectOutlined, FileTwoTone, LogoutOutlined, MoneyCollectOutlined, MoneyCollectTwoTone } from '@ant-design/icons';
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
import customersServices from '../../services/CustomersServices';
import NewSalePayment from '../../components/NewSalePayment';
import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';

import personIcon from '../../img/icons/person1.png';
import invoiceIcon from '../../img/icons/invoice.png';
import invoiceTaxIcon from '../../img/icons/invoicetax.png';
import { GBooksIcon, GPendingAccountsIcon, GRefreshIcon } from '../../utils/IconImageProvider';
import productPurchasesServices from '../../services/ProductPurchasesServices';
import suppliersServices from '../../services/SuppliersServices';
import NewProductPurchasePayment from '../../components/NewProductPurchasePayment';
import { filterData } from '../../utils/Filters.js';
import ProductPurchasePreview from '../../components/previews/ProductPurchasePreview.js';
import reportsServices from '../../services/ReportsServices.js';
import download from 'downloadjs';

const { confirm } = Modal;
const { Search } = Input;

function PendingPurchases() {
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [pendingAccountsFilter, setPendingAccountsFilter] = useState(0);
  const [openPurchasePreviewModal, setOpenPurchasePreviewModal] = useState(false);
  const [purchaseSelectedId, setPurchaseSelectedId] = useState(0);

  const [ableToProcess, setIsAbleToProcess] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [entityDataFiltered, setEntityDataFiltered] = useState('');
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [entityRefreshData, setEntityRefreshData] = useState(0);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  const [saleProductPurchaseToPay, setProductPurchaseSelectedToPay] = useState(0);
  const [saleDocumentNumberSelected, setSaleDocumentNumberSelected] = useState(0);

  const navigate = useNavigate();
  
  function loadData() {
    setFetching(true);
    productPurchasesServices.findPendingsByLocation(getUserLocation())
    .then((response) => {
      setEntityData(response.data);
      setFetching(false);
    })
    .catch((error) => {
      customNot('error', 'Sin información', 'Revise su conexión a la red');
      setFetching(false);
    });
  }

  function loadDetailData(supplierId) {
    setFetching(true);
    suppliersServices.findPendingPurchases(supplierId || 0)
    .then((response) => {
      setEntitySelectedId(supplierId);
      setEntityDetailData(response.data);
      setEntityDataFiltered(entityData.find((x) => x.supplierId === supplierId)['supplierName'] || '');
      setFetching(false);
    })
    .catch((error) => {
      customNot('error', 'Sin información', 'Revise su conexión a la red');
      setFetching(false);
    });
  }

  useEffect(() => {
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
        (pendingAccountsFilter === 1 && +x.expiredPurchases > 0)
      ));
    } else {
      return entityData || [];
    }
  }

  async function fetchExcelReport() {
    setFetching(true);
    try {
      const res = await reportsServices.excel.getPendingProductPurchases();
      download(res.data, `ReporteProveedoresSaldosPendientes.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  const columns = [
    columnDef({title: 'Nombre', dataKey: 'customerFullname'}),
    columnDef({title: 'C. Pendientes', dataKey: 'pendingSales'}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Opciones'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              style={{ fontSize: 10, backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              onClick={() => { 
                loadDetailData(record.supplierId)
              }}
            >
              {'Detalles'}
            </Button>
          </Space>
        )
      }
    },
  ];

  return (
    <Wrapper xCenter>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
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
              <Button icon={<FileTwoTone twoToneColor={'#eb2f96'} />} loading={fetching} onClick={(e) => {e.stopPropagation()}}>
                Saldos Pendientes
              </Button>
            </Dropdown>
            <Button
              // type='primary'
              onClick={() => loadData()}
            >
              <Space>
                <GRefreshIcon width={'16px'} />
                {'Actualizar'}
              </Space>
            </Button>
          </Space>
        </Col>
        <Col span={8}>
          {/* <p style={{ fontWeight: 600, fontSize: 20 }}>Clientes pendientes</p> */}
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
          <p style={{ margin: 0, fontSize: 12 }}>Nombre de proveedor:</p>
          <Search
            name={'filter'}
            value={filter} 
            placeholder="PROVEEDOR SA DE CV" 
            allowClear 
            style={{ width: '100%', marginBottom: 5 }}
            onChange={(e) => setFilter(e.target.value)}
            size={'large'}
          />
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={filterData(getPendingAccountsByFilter(), filter, ['supplierName']) || [] || []}
            renderItem={item => (
              <List.Item
                onClick={() => loadDetailData(item.supplierId)}
                style={{
                  backgroundColor: item.supplierId === entitySelectedId ? '#d9d9d9' : 'transparent',
                  borderLeft: `5px solid ${item.supplierId === entitySelectedId ? '#ff85c0' : '#ffd6e7'}`,
                  borderBottom: `5px solid ${item.supplierId === entitySelectedId ? '#ff85c0' : '#ffd6e7'}`,
                  borderRight: `1px solid ${item.supplierId === entitySelectedId ? '#ff85c0' : '#ffd6e7'}`,
                  borderTop: `1px solid ${item.supplierId === entitySelectedId ? '#ff85c0' : '#ffd6e7'}`,
                  marginBottom: `5px`,
                  borderRadius: 10
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar src={personIcon} style={{ backgroundColor: 'transparent' }} />}
                  title={<p style={{ margin: 0 }}>{item.supplierName}</p>}
                  description={
                    <>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>{`Deuda total: $${+item.totalAmountPending || 0}`}</p>
                      <p style={{ margin: 0, fontSize: 10 }}>{`${item.pendingProductPurchases} ${item.pendingProductPurchases > 1 ? 'cuentas pendientes' : 'cuenta pendiente'}`}</p>
                      {
                        +(item.expiredPurchases) > 0 ?
                          <p style={{ margin: 0, fontSize: 10, color: 'red' }}>{`${item.expiredPurchases} ${item.expiredPurchases > 1 ? 'vencidas' : 'vencida'}`}</p> :
                          <></>
                      }
                    </>
                  }
                />
              </List.Item>
            )}
            pagination
          />
        </Col>
        <Col span={16}>
          {/* <p style={{ fontSize: 18 }}>{`${entityDataFiltered}`}</p> */}
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={entityDetailData || []}
            renderItem={(item, index) => (
              <List.Item
                // onClick={() => loadDetailData(item.supplierId)}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#F0F2F5',
                  borderLeft: '5px solid #ffd6e7',
                  borderBottom: '5px solid #ffd6e7',
                  borderRight: '1px solid #ffd6e7',
                  borderTop: '1px solid #ffd6e7',
                  marginBottom: '5px',
                  borderRadius: 10
                }}
                extra={[
                  <Button
                    onClick={() => {
                      setPurchaseSelectedId(item.productPurchaseId);
                      setOpenPurchasePreviewModal(true);
                    }}
                    icon={<EyeTwoTone />}
                  >
                    Ver
                  </Button>,
                  <div style={{ width: 10 }} />,
                  <Button
                    onClick={() => { 
                      setProductPurchaseSelectedToPay(item.productPurchaseId);
                      setSaleDocumentNumberSelected(item.documentNumber);
                      setOpenModal(true);
                    }}
                    icon={<MoneyCollectTwoTone twoToneColor={'green'} />}
                  >
                    Pagar
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
                        style={{ margin: 0 }}
                      >
                        {`${item.documentTypeName} ${item.documentNumber || '-'}`}
                      </p>
                      <p 
                        style={{ margin: 0, fontSize: 12, fontWeight: 400 }}
                      >
                        {`No de Orden ${item.documentOrderPurchaseNumber || '-'}`}
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
                      <p style={{ margin: 0 }}>{`Debe `}<Tag color={'red'}>{`$ ${item.productPurchasePendingAmount}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Pagado `}<Tag color={'green'}>{`$ ${item.productPurchaseTotalPaid}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Total `}<Tag>{`$ ${item.productPurchaseTotal}`}</Tag></p>
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination
          />
        </Col>
      </Row>
      <NewProductPurchasePayment 
        open={openModal}
        productPurchaseId={saleProductPurchaseToPay}
        documentNumber={saleDocumentNumberSelected}
        onClose={(success) => {
          setOpenModal(false);
          if (success) {
            loadData();
            loadDetailData(entitySelectedId);
            setProductPurchaseSelectedToPay(0);
            setSaleDocumentNumberSelected(0);
          }
        }}
      />
      <ProductPurchasePreview
        open={openPurchasePreviewModal}
        productPurchaseId={purchaseSelectedId}
        allowActions={false}
        onClose={(wasVoided) => {
          setOpenPurchasePreviewModal(false);
          setPurchaseSelectedId(0);
          if(wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default PendingPurchases;

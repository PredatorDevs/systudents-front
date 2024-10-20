import {
  Col,
  Row,
  Button,
  Space,
  Tag,
  Modal,
  DatePicker,
  Skeleton
} from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Wrapper } from '../styled-components/Wrapper.js';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, DollarOutlined, FileOutlined, FilePdfOutlined, LogoutOutlined, PlusOutlined, SearchOutlined, SyncOutlined, WarningFilled } from '@ant-design/icons';
import { TableContainer } from '../styled-components/TableContainer.js';
import { columnActionsDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../utils/ColumnsDefinitions.js';
import { customNot } from '../utils/Notifications.js';
import { CompanyInformation } from '../styled-components/CompanyInformation.js';
import salesServices from '../services/SalesServices.js';
import SalePreview from '../components/previews/SalePreview.js';
import { getUserLocation, getUserMyCashier } from '../utils/LocalData.js';
import generalsServices from '../services/GeneralsServices.js';
import { forEach, isEmpty } from 'lodash';
import cashiersServices from '../services/CashiersServices.js';
import orderSalesServices from '../services/OrderSalesServices.js';
import OrderSalePreview from '../components/previews/OrderSalePreview.js';
import { GRestoreIcon } from '../utils/IconImageProvider.js';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import reportsServices from '../services/ReportsServices.js';
import DoughnutChart from '../components/charts/DoughnutChart.js';
import LineChart from '../components/charts/LineChart.js';
import BarChart from '../components/charts/BarChart.js';
import ReactToPrint from 'react-to-print';

const { confirm } = Modal;

function DashboardPage() {
  const initialShowChartFlags = {
    showTopProduct: true,
    showTopSellers: true,
    showLocationSales: true,
    showTopCustomers: true,
  };

  const [showChart, setShowChart] = useState(initialShowChartFlags);

  const [fetching, setFetching] = useState(false);
  const [ableToProcess, setAbleToProcess] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [entitySelectedId, setEntitySelectedId] = useState(0);

  const [startDateFilter, setStartDateFilter] = useState(defaultDate());
  const [endDateFilter, setEndDateFilter] = useState(defaultDate());

  const navigate = useNavigate();
  const dashboardRef = useRef();

  function defaultDate() {
    return moment();
  };

  async function loadData() {
    setFetching(true);
    
    const response = await reportsServices.getMainDashboardData(
      startDateFilter.format("YYYY-MM-DD"),
      endDateFilter.format("YYYY-MM-DD")
    );

    const { data } = response;

    const topProductIsEmpty = isEmpty(data[0]);
    const topSellersIsEmpty = isEmpty(data[1]);
    const locationSalesIsEmpty = isEmpty(data[2]);
    const topCustomersIsEmpty = isEmpty(data[3]);

    console.log(showChart);

    setShowChart({
      ...showChart,
      showTopProduct: !topProductIsEmpty,
      showTopSellers: !topSellersIsEmpty,
      showLocationSales: !locationSalesIsEmpty,
      showTopCustomers: !topCustomersIsEmpty,
    });
    
    console.log(showChart);
    
    setEntityData(data);
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    // columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Código', dataKey: 'id'}),
    columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
    // columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-'}),
    columnDef({title: 'Fecha', dataKey: 'documentDatetime'}),
    columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
    // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
    columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
    // columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 }),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Estado'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (text, record, index) => {
        return (
          <Tag color={`${record.statusColor}`}>{`${record.statusName}`}</Tag>
          )
        }
      },
    // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
    columnMoneyDef({title: 'Total', dataKey: 'total'}),
    // columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid'}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Space style={{ display: record.status === 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'flex-end' }} size={'small'}>
            {/* <Tooltip placement="left" title={`Reincorporar`}> */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/main/sales/new', { state: { orderSaleId: record.id } })
                }}
                // size='small'
              >
                Facturar
              </Button>
            {/* </Tooltip> */}
            {/* <Tooltip placement="left" title={``}> */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  confirm({
                    title: `¿Está seguro de que desea descartar Orden de Venta No ${record.id}?`,
                    icon: <WarningFilled />,
                    content: `Se descartara y no podrá ser facturada `,
                    okText: 'CONFIRMAR',
                    cancelText: 'Cancelar',
                    async onOk() {
                      setFetching(true);
                      try {
                        const res = await orderSalesServices.changeStatus(3, record.id);
                        customNot('success', 'Orden de venta fue descartada con exito', 'Acción terminada');
                        loadData();
                      } catch(error) {
                        
                      }
                      setFetching(false);
                    },
                    onCancel() {},
                  });
                }}
                // size='small'
              >
                Descartar
              </Button>
            {/* </Tooltip> */}
          </Space>
        )
      }
    }
  ];

  function buildTopProductsChartLabels() {
    let chartLabel = [];

    if (!isEmpty(entityData)) {
      const products = entityData[0];
      for (let product of products) {
        chartLabel.push(product?.productName || '');
      }
    }
    return chartLabel;
  }

  function buildTopProductsChartDataSet() {
    if(!isEmpty(entityData)) {
      const products = entityData[0];

      const chartdata = [{
        label: 'Uds Vendidas',
        data: products.map((x) => +x.quantitySale),
        borderWidth: 1,
        borderColor: [
          '#1866B4',
          '#CC4300',
          '#03734D',
          '#D70947',
          '#772ACB',
          '#087783',
          '#2531D4',
          '#921473',
          '#3C6372',
          '#D62F2F'
        ],
        backgroundColor: [
          '#B2D4F5',
          '#FCC3A7',
          '#8FD1BB',
          '#F8B4C9',
          '#D3BDEB',
          '#83D1DA',
          '#99A0F9',
          '#E597D2',
          '#D1D9DC',
          '#FCCACA'
        ],
      }];

      return chartdata;
    }
  }

  function buildTopSellersChartLabels() {
    let chartLabel = [];

    if (!isEmpty(entityData)) {
      const sellers = entityData[1];
      for (let seller of sellers) {
        chartLabel.push(seller?.userFullname || '');
      }
    }
    return chartLabel;
  }

  function buildTopSellersChartDataSet() {
    if(!isEmpty(entityData)) {
      const sellers = entityData[1];

      const chartdata = [{
        label: 'Total vendido',
        data: sellers.map((x) => +x.totalSale),
        borderWidth: 1,
        borderColor: [
          '#1866B4'
        ],
        backgroundColor: [
          '#B2D4F5'
        ],
      }];

      return chartdata;
    }
  }

  function buildLocationSalesChartLabels() {
    let chartLabel = [];

    if (!isEmpty(entityData)) {
      const locations = entityData[2];
      for (let location of locations) {
        chartLabel.push(location?.locationName || '');
      }
    }
    return chartLabel;
  }

  function buildLocationSalesChartDataSet() {
    if(!isEmpty(entityData)) {
      const locations = entityData[1];

      const chartdata = [{
        label: 'Total vendido',
        data: locations.map((x) => +x.totalSale),
        borderWidth: 1,
        borderColor: [
          '#087783'
        ],
        backgroundColor: [
          '#83D1DA'
        ],
      }];

      return chartdata;
    }
  }

  function buildTopCustomersChartLabels() {
    let chartLabel = [];

    if (!isEmpty(entityData)) {
      const customers = entityData[3];
      for (let customer of customers) {
        chartLabel.push(customer?.customerFullname || '');
      }
    }
    return chartLabel;
  }

  function buildTopCustomersChartDataSet() {
    if(!isEmpty(entityData)) {
      const customers = entityData[3];

      const chartdata = [{
        label: 'Total comprado',
        data: customers.map((x) => +x.totalSale),
        borderWidth: 1,
        borderColor: [
          '#921473'
        ],
        backgroundColor: [
          '#E597D2'
        ],
      }];

      return chartdata;
    }
  }

  return (
    <Wrapper ref={dashboardRef}>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space wrap>
            <DatePicker 
              locale={locale}
              format="DD-MMMM-YYYY"
              picker='day'
              value={startDateFilter}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setStartDateFilter(datetimeMoment);
              }}
            />
            <DatePicker 
              locale={locale}
              format="DD-MMMM-YYYY"
              picker='day'
              value={endDateFilter}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setEndDateFilter(datetimeMoment);
              }}
            />
            <Button
              onClick={(e) => {
                loadData();
              }}
              icon={<SearchOutlined />}
              loading={fetching}
            >
              Buscar
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button
                  loading={fetching}
                  icon={<FilePdfOutlined />}
                >
                  Imprimir Dashboard
                </Button>
              )}
              content={() => dashboardRef.current}
              pageStyle={`@page { margin: 40px 40px 40px 40px !important; size: landscape; }`}
            />
          </Space>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{
            height: 350,
            backgroundColor: '#fafafa',
            borderRadius: 5,
            border: '1px solid #bfbfbf'
          }}
        >
          {
            fetching || !showChart.showTopProduct ? <Skeleton active={fetching} style={{ padding: 20 }} /> : (
              <DoughnutChart
                legendText={`TOP 10 PRODUCTOS MAS VENDIDOS`}
                chartLabels={buildTopProductsChartLabels()}
                chartDataset={buildTopProductsChartDataSet()}
              />
            )
          }
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{
            height: 350,
            backgroundColor: '#fafafa',
            borderRadius: 5,
            border: '1px solid #bfbfbf',
            padding: 5
          }}
        >
          {
            fetching || !showChart.showTopSellers ? <Skeleton active={fetching} style={{ padding: 20 }} /> : (
              <BarChart
                legendText={'TOP 5 VENDEDORES'}
                chartLabels={buildTopSellersChartLabels()}
                chartDataset={buildTopSellersChartDataSet()}
              />
            )
          }
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{
            height: 350,
            backgroundColor: '#f5f5f5',
            borderRadius: 5,
            border: '1px solid #bfbfbf',
            padding: 5
          }}
        >
          {
            fetching || !showChart.showLocationSales ? <Skeleton active={fetching} style={{ padding: 20 }} /> : (
              <BarChart
                legendText={'VENTA TOTAL POR SUCURSAL'}
                chartLabels={buildLocationSalesChartLabels()}
                chartDataset={buildLocationSalesChartDataSet()}
              />
            )
          }
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{
            height: 350,
            backgroundColor: '#f5f5f5',
            borderRadius: 5,
            border: '1px solid #bfbfbf',
            padding: 5
          }}
        >
          {
            fetching || !showChart.showTopCustomers ? <Skeleton active={fetching} style={{ padding: 20 }} /> : (
              <BarChart
                legendText={'TOP 10 CLIENTES'}
                chartLabels={buildTopCustomersChartLabels()}
                chartDataset={buildTopCustomersChartDataSet()}
              />
            )
          }
        </Col>
        {/* <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{
            height: 350,
            backgroundColor: '#f5f5f5',
            borderRadius: 5,
            border: '1px solid #bfbfbf',
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%', padding: 5 }}>
            <Col span={8}>
              Screening calls:
            </Col>
            <Col span={16} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '100%', backgroundColor: '#bfbfbf', height: 30, borderRadius: 15, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '65%', backgroundColor: '#8c8c8c', height: 30, color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  Calls 68
                </div>
                <div style={{ width: '35%', backgroundColor: '#1677ff', height: 30, color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  Messages 120
                </div>
              </div>
            </Col>
            <Col span={8}>
              Intermediary Rounds:
            </Col>
            <Col span={16} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '75%', backgroundColor: '#bfbfbf', height: 30, borderRadius: 15, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
                  <div style={{ width: '100%', backgroundColor: '#8c8c8c', height: 30, color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    123
                  </div>
                </div>
            </Col>
            <Col span={8}>
              Final Rounds:
            </Col>
            <Col span={16} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '50%', backgroundColor: '#bfbfbf', height: 30, borderRadius: 15, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '100%', backgroundColor: '#8c8c8c', height: 30, color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  50
                </div>
              </div>
            </Col>
          </Row>
        </Col> */}
      </Row>
    </Wrapper>
  );
}

export default DashboardPage;

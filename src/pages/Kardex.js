import React, { useEffect, useState } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import { CompanyInformation } from '../styled-components/CompanyInformation';
import styled from 'styled-components';
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  PageHeader,
  Row,
  Select,
  Space,
  Table
} from 'antd';
import {
  SearchOutlined,
  PrinterOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  SyncOutlined,
  FilePdfTwoTone
} from '@ant-design/icons';
import productsServices from '../services/ProductsServices';
import { customNot } from '../utils/Notifications';
import { find, isEmpty } from 'lodash';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { TableContainer } from '../styled-components/TableContainer';
import { columnActionsDef, columnDef } from '../utils/ColumnsDefinitions';
import reportsServices from '../services/ReportsServices';
import { getUserLocation } from '../utils/LocalData';
import { BlobProvider } from '@react-pdf/renderer';
import SettlementOrderSalePDF from '../components/reports/SettlementOrderSalePDF';
import KardexPDF from '../components/reports/KardexPDF';
import { GGoBackIcon, GPdfFileIcon } from '../utils/IconImageProvider';
import { MainMenuCard } from '../styled-components/MainMenuCard';

const { RangePicker } = DatePicker;
const { Option } = Select;

const styleSheet = {
  tblHead: {
    border: '1px solid #bfbfbf',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 5,
    fontSize: 11
  },
  tblRowOne: {
    border: '1px solid #bfbfbf',
    backgroundColor: '#e6f4ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 5,
    fontSize: 11
  },
  tblRowTwo: {
    border: '1px solid #bfbfbf',
    backgroundColor: '#e6fffb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 5,
    fontSize: 11
  },
  tblRowThree: {
    border: '1px solid #bfbfbf',
    backgroundColor: '#f0f5ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
    padding: 5,
    fontSize: 11
  },
  tblRowFour: {
    border: '1px solid #bfbfbf',
    backgroundColor: '#f9f0ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
    padding: 5,
    fontSize: 11
  }
};

function Kardex() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState(false);
  const [entityRefreshData, setEntityRefreshData] = useState(0);

  const [kardexData, setKardexData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [productSelected, setProductSelected] = useState(0);
  const [productInitialStock, setProductInitialStock] = useState(0);

  const [initialDate, setInitialDate] = useState(moment().startOf('year'));
  const [finalDate, setFinalDate] = useState(moment().endOf('year'));

  useEffect(() => {
    generateKardexView();
  }, []);

  function generateKardexView() {
    if (!(state !== null && state?.productId !== undefined)) {
      customNot('warning', 'Seleccione un producto', 'Para generar datos debe seleccionar un producto');
      return;
    }

    setFetching(true);
    
    customNot('info', 'Consultando registros', 'Esto puede tomar unos segundos...');
    
    reportsServices.calculatedKardexByProduct(
      getUserLocation(), 
      state?.productId,
      initialDate?.format('YYYY-MM-DD'),
      finalDate?.format('YYYY-MM-DD')
    )
    .then((response) => {
      customNot('info', 'Procesando información', 'Esto puede tomar unos segundos...');

      const { data } = response;
      const executedData = [];

      for (let i = 0; i < data[1].length; i++) {
        if (i === 0) {
            executedData[i] = { ...data[1][i], initialBalance: +data[1][i].documentProductQuantity, lastBalance: +data[1][i].documentProductQuantity}
          } else {
            if (data[1][i].documentType === 1) {
                executedData[i] = { ...data[1][i], initialBalance: +executedData[i - 1].lastBalance, lastBalance: +executedData[i - 1].lastBalance + +data[1][i].documentProductQuantity};
              } else {
                executedData[i] = { ...data[1][i], initialBalance: +executedData[i - 1].lastBalance, lastBalance: +executedData[i - 1].lastBalance - +data[1][i].documentProductQuantity};
              }
          }
      }

      customNot('success', 'Informacion obtenida', '');
      setKardexData(executedData);
      setFetching(false);
    })
    .catch((error) => {
      customNot('error', 'Sin información', 'Revise su conexión a la red');
      setFetching(false);
    });
  }

  function getFilteredKardexDataByRangeDate() {
    if (isEmpty(kardexData)) {
      return [];
    }
    let filteredData = [];
    filteredData = kardexData.filter((element, index) => {
      const formattedInitialDate = initialDate?.format('YYYY-MM-DD');
      const formattedFinalDate = finalDate?.format('YYYY-MM-DD');
      const formattedDocumentDate = moment(element.documentDatetime).format('YYYY-MM-DD');

      return moment(formattedDocumentDate).isBetween(formattedInitialDate, formattedFinalDate, undefined, '[]');
    });
    return filteredData || [];
  }

  return (
    <Wrapper>
      
      {
        state?.productId !== 0 && state?.productId !== null ? (
          <>
            <div style={{ display: 'none' }}>
              <BlobProvider
                document={
                  <KardexPDF 
                    reportData={getFilteredKardexDataByRangeDate()}
                    rangeDate={{ initialDate: initialDate?.format('LL'), finalDate: finalDate?.format('LL')}}
                    productSelectedName={state?.productName}
                  />}
              >
                {({ blob, url, loading, error }) => {
                  // Do whatever you need with blob here
                  return <a href={url} id={'print-kardex-1-button'} target="_blank" rel="noreferrer">Open in new tab</a>;
                }}
              </BlobProvider>
            </div>
            <PageHeader
              onBack={() => {
                navigate('/main/inventory/products')
              }}
              backIcon={<ArrowLeftOutlined />}
              title={`${state?.productName}`}
              subTitle={`KARDEX - ${state?.locationName}`}
              style={{ margin: 0, marginBottom: 20, padding: 0 }}
              extra={[
                <Button
                  id={'kardex-refresh-button'}
                  icon={<SyncOutlined />}
                  onClick={() => generateKardexView()}
                >
                  Actualizar
                </Button>
              ]}
            />
            <Row gutter={[8, 8]} style={{ width: '100%' }}>
              <Col span={24} style={{ marginBottom: 20 }}>
                <Space size={'large'} align='end'>
                  <div>
                    <p style={{ margin: '0px' }}>{'Inicial'}</p>
                    <DatePicker
                      id={'kardex-initial-date-picker'}
                      locale={locale} 
                      format={"DD-MM-YYYY"}
                      value={initialDate}
                      onChange={(date, stringDate) => {
                        setInitialDate(date);
                        document.getElementById('kardex-final-date-picker').focus();
                      }}
                      onFocus={() => {
                        document.getElementById('kardex-initial-date-picker').select();
                      }}
                    />
                  </div>
                  <div>
                    <p style={{ margin: '0px' }}>{'Final'}</p>
                    <DatePicker 
                      id={'kardex-final-date-picker'}
                      locale={locale} 
                      format={"DD-MM-YYYY"}
                      value={finalDate}
                      onChange={(date, stringDate) => {
                        setFinalDate(date);
                        document.getElementById('kardex-search-button').focus();
                      }}
                      onFocus={() => {
                        document.getElementById('kardex-final-date-picker').select();
                      }}
                    />
                  </div>
                  <Button
                    id={'kardex-refresh-button'}
                    icon={<FilePdfTwoTone twoToneColor={'#f5222d'} />}
                    onClick={() => {
                      document.getElementById('print-kardex-1-button').click();
                    }}
                  >
                    Generar PDF
                  </Button>
                </Space>
              </Col>
              <Col span={24}>
                <Row gutter={[0, 0]}>
                  <Col span={9}>{''}</Col>
                  <Col span={5} style={styleSheet.tblHead}>{'Compras'}</Col>
                  <Col span={4} style={styleSheet.tblHead}>{'Ventas'}</Col>
                  <Col span={6}>{''}</Col>

                  <Col span={1} style={styleSheet.tblHead}>{'Corr'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Fecha'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'N° Doc'}</Col>
                  <Col span={3} style={styleSheet.tblHead}>{'Prov / Cliente'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Nacion.'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Inicial'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Unidades compradas'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Costo'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Costo total'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Total unidades'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Unidades vendidas'}</Col>
                  <Col span={1} style={styleSheet.tblHead}>{'Previo venta'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Venta total'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Inventario final'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Costo unitario'}</Col>
                  <Col span={2} style={styleSheet.tblHead}>{'Costo total'}</Col>

                  {
                    getFilteredKardexDataByRangeDate().map((element, index) => {
                      return (
                        <>
                          <Col span={1} style={styleSheet.tblRowOne}>
                            {`${element.documentCorrelative}`}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowTwo}>
                            {`${element.documentDatetimeFormatted}`}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowOne}>
                            {`${element.documentNumber || ''}`}
                          </Col>
                          <Col span={3} style={styleSheet.tblRowTwo}>
                            {`${element.documentConcept} - ${element.documentPerson || ''}`}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowOne}>
                            {`${element.documentNationality}`}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowThree}>
                            {`${Number(element.initialBalance).toFixed(2) || 0.00}`}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowFour}>
                            {(element.documentType === 1) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowThree}>
                            {(element.documentType === 1) ? Number(element.documentUnitValue).toFixed(2) : 0.00}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowFour}>
                            {(element.documentType === 1) ? ((Number(element.documentUnitValue)|| 0) * (Number(element.documentProductQuantity) || 0)).toFixed(2) : 0.00}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowThree}>
                            {(element.documentType === 1) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowFour}>
                            {(element.documentType === 2) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                          </Col>
                          <Col span={1} style={styleSheet.tblRowThree}>
                            {(element.documentType === 2) ? Number(element.documentUnitValue).toFixed(2) : 0.00}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowFour}>
                            {(element.documentType === 2) ? ((Number(element.documentUnitValue)|| 0) * (Number(element.documentProductQuantity) || 0)).toFixed(2) : 0.00}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowThree}>
                            {`${Number(element.lastBalance).toFixed(2) || 0.00}`}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowFour}>
                            {`${Number(element.documentUnitCost).toFixed(2) || 0.00}`}
                          </Col>
                          <Col span={2} style={styleSheet.tblRowThree}>
                            {((Number(element.lastBalance)|| 0) * (Number(element.documentUnitCost) || 0)).toFixed(2)}
                          </Col>
                        </>
                      )
                    })
                  }
                </Row>
              </Col>
            </Row>
          </>
        ) : (
          <></>
        )
      }
    </Wrapper>
  );
}

export default Kardex;

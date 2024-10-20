import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import locationsService from '../../services/LocationsServices';
import { Button, Col, DatePicker, Descriptions, Input, PageHeader, Radio, Row, Select, Space, Table, Tabs } from 'antd';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { FileExcelTwoTone, FilePdfTwoTone, FileSearchOutlined, RiseOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { filter, forEach, isEmpty } from 'lodash';
import generalsServices from '../../services/GeneralsServices';
import reportsServices from '../../services/ReportsServices';
import { columnActionsDef, columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef, columnNumberDef } from '../../utils/ColumnsDefinitions';
import { validateSelectedData, validateStringData } from '../../utils/ValidateData';
import download from 'downloadjs';
import salesServices from '../../services/SalesServices';
import { GAddFileIcon, GBooksIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';
import SalePreview from '../../components/previews/SalePreview';
import LocationSelector from '../../components/selectors/LocationSelector';
import { getUserLocation } from '../../utils/LocalData';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function IssuedSalesByDocNumber() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  // const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  const [locationSelectedId, setLocationSelectedId] = useState(getUserLocation());
  // const [cashierSelectedId, setCashierSelectedId] = useState(0);

  const [entitydata, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  // const [cashiersData, setCashiersData] = useState([]);

  const [initialDate, setInitialDate] = useState(moment().startOf('month'));
  const [finalDate, setFinalDate] = useState(moment().endOf('month'));

  function defaultDate() {
    return moment();
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    try {
      // const locRes = await locationsService.find();
      // const docTypesRes = await generalsServices.findDocumentTypes();

      // setLocationsData(locRes.data);
      // setDocumentTypesData(docTypesRes.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function searchAction() {
    setFetching(true);
    try {
      const res = await reportsServices.getProfitReportByLocationDateRange(locationSelectedId, initialDate.format('YYYY-MM-DD'), finalDate.format('YYYY-MM-DD'));
      console.log(res.data);
      setEntityData(res.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function fetchPDFReport() {
    setFetching(true);
    try {
      const res = await salesServices.pdfDocs.findByDocNumber(documentNumber, documentTypeSelectedId);
      download(res.data, `ReporteVentasEmitidasPorCorrelativo.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchExcelReport() {
    setFetching(true);
    try {
      const res = await reportsServices.excel.getProfitReportByLocationDateRange(locationSelectedId, initialDate.format('YYYY-MM-DD'), finalDate.format('YYYY-MM-DD'));
      download(res.data, `ReporteUtilidades.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
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

  function getDataSumByProperty(propertyName) {
    let total = 0;
    forEach(entitydata, (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <PageHeader
            onBack={() => null}
            backIcon={<RiseOutlined />}
            title={`Reporte de Utilidades`}
            subTitle={``}
            extra={[
              <Button
                icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
                onClick={() => {
                  // loadData();
                  fetchExcelReport();
                }}
                loading={fetching}
                disabled={isEmpty(entitydata)}
              >
                Generar Excel
              </Button>,
              <Button
                icon={<FilePdfTwoTone twoToneColor={'#f5222d'} />}
                onClick={() => {
                  // loadData();
                  fetchPDFReport();
                }}
                loading={fetching}
                // disabled={isEmpty(entitydata)}
                disabled={true}
              >
                Generar PDF
              </Button>
            ]}
          />
        </Col>
        <Col span={12}>
          <LocationSelector
            label={'Sucursal:'}
            onSelect={(value) => {
              setLocationSelectedId(value);
            }}
          />
        </Col>
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
              icon={<SearchOutlined />}
              loading={fetching}
              onClick={() => {
                searchAction();
              }}
            >
              Buscar
            </Button>
          </Space>
        </Col>
        <Col span={12}>
          <Descriptions
            bordered
            labelStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
            contentStyle={{ fontSize: 14, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
            style={{ width: '100%' }}
            size={'small'}
          >
            <Descriptions.Item label="Del" span={3}>{initialDate.format('LL') || ''}</Descriptions.Item>
            <Descriptions.Item label="Al" span={3}>{finalDate.format('LL') || ''}</Descriptions.Item>
            <Descriptions.Item label="Venta Total" span={3}>{getDataSumByProperty('taxableSubTotal') || ''}</Descriptions.Item>
            <Descriptions.Item label="Costo Total" span={3}>{getDataSumByProperty('totalCost') || ''}</Descriptions.Item>
            <Descriptions.Item label="Utilidad Total" span={3}>{getDataSumByProperty('profit') || ''}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={24}>
          <Table 
            loading={fetching}
            size='small'
            style={{ width: '100%' }}
            rowKey={'rowNum'}
            dataSource={[
              ...entitydata,
              {
                productName: 'TOTAL',
                taxableSubTotal: getDataSumByProperty('taxableSubTotal'),
                totalCost: getDataSumByProperty('totalCost'),
                profit: getDataSumByProperty('profit')
              }
            ] || []}
            columns= {[
              // columnDef({title: 'Id', dataKey: 'id'}),
              columnDef({title: 'Fecha', dataKey: 'docDatetimeFormat', fSize: 11 }),
              columnDef({title: 'Tipo', dataKey: 'documentTypeName', fSize: 11 }),
              columnDef({title: 'Documento', dataKey: 'docNumber', ifNull: '-', fSize: 11 }),
              columnDef({title: 'Categoria', dataKey: 'categoryName', fSize: 11 }),
              columnDef({title: 'Cod. Prod', dataKey: 'productCode', fSize: 11 }),
              columnDef({title: 'Producto', dataKey: 'productName', fSize: 11 }),
              columnNumberDef({title: 'Cantidad', dataKey: 'quantity', align: 'right', fSize: 11 }),
              columnMoneyDef({title: 'Precio Venta', dataKey: 'unitPrice', showDefaultString: true , fSize: 11 }),
              columnMoneyDef({title: 'Venta Total', dataKey: 'taxableSubTotal', showDefaultString: true, fSize: 11 }),
              columnMoneyDef({title: 'Costo Venta', dataKey: 'unitCost', showDefaultString: true , fSize: 11 }),
              columnMoneyDef({title: 'Costo Total', dataKey: 'totalCost', showDefaultString: true, fSize: 11 }),
              columnMoneyDef({title: 'Utilidad', dataKey: 'profit', showDefaultString: true, fSize: 11 }),
            ]}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  setEntitySelectedId(record.id);
                  setOpenPreview(true);
                }
              };
            }}
            // pagination={{ defaultPageSize: 200, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'] }}
            pagination={false}
          />
        </Col>
        <SalePreview
          open={openPreview}
          saleId={entitySelectedId}
          allowActions={false}
          onClose={(wasVoided) => {
            setOpenPreview(false);
            if (wasVoided) loadData();
          }}
        />
      </Row>
    </Wrapper>
  );
}

export default IssuedSalesByDocNumber;

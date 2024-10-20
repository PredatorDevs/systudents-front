import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import locationsService from '../../services/LocationsServices';
import { Button, Col, DatePicker, Descriptions, Input, PageHeader, Radio, Row, Select, Space, Table, Tabs } from 'antd';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { FileExcelTwoTone, FilePdfTwoTone, FileSearchOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { filter, forEach, isEmpty } from 'lodash';
import generalsServices from '../../services/GeneralsServices';
import reportsServices from '../../services/ReportsServices';
import { columnActionsDef, columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef, columnNumberDef } from '../../utils/ColumnsDefinitions';
import { validateSelectedData, validateStringData } from '../../utils/ValidateData';
import download from 'downloadjs';
import salesServices from '../../services/SalesServices';
import { GAddFileIcon, GBooksIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';
import SalePreview from '../../components/previews/SalePreview';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function IssuedSalesByDocNumber() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  // const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  // const [locationSelectedId, setLocationSelectedId] = useState(0);
  // const [cashierSelectedId, setCashierSelectedId] = useState(0);

  const [entitydata, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  // const [cashiersData, setCashiersData] = useState([]);

  function defaultDate() {
    return moment();
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    try {
      const locRes = await locationsService.find();
      const docTypesRes = await generalsServices.findDocumentTypes();

      setLocationsData(locRes.data);
      setDocumentTypesData(docTypesRes.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function searchAction() {
    setFetching(true);
    try {
      const res = await salesServices.findByDocNumber(documentNumber, documentTypeSelectedId);
      setEntityData(res.data);
      document.getElementById('g-sale-doc-number-input').focus();
      document.getElementById('g-sale-doc-number-input').select();
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
      const res = await salesServices.excelDocs.findByDocNumber(documentNumber, documentTypeSelectedId);
      download(res.data, `ReporteVentasEmitidasPorCorrelativo.xlsx`);
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
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col span={24}>
        <PageHeader
          onBack={() => null}
          backIcon={<FileSearchOutlined />}
          title={`Ventas Emitidas`}
          subTitle={`Búsqueda por Correlativo`}
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
              disabled={isEmpty(entitydata)}
            >
              Generar PDF
            </Button>
          ]}
        />
      </Col>
      <Col span={24}>
        <Space>
          <Radio.Group
            buttonStyle="solid"
            value={documentTypeSelectedId}
            onChange={(e) => {
              setDocumentTypeSelectedId(e.target.value);
            }}
          >
            <Radio.Button key={0} value={0}>
              <Space>
              <GBooksIcon width={'16px'} />
                Todos
              </Space>
            </Radio.Button>
            {
              (filter(documentTypesData, ['enableForSales', 1]) || []).map((element) => {
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
      <Col span={24}>
        <Space>
          <Input 
            id='g-sale-doc-number-input'
            style={{ width: '100%' }} 
            placeholder={'Ingrese Correlativo'}
            value={documentNumber} 
            onChange={(e) => setDocumentNumber(e.target.value)}
            // onBlur={(e) => { validateDocNumber(); }}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter')
                  if (validateStringData(documentNumber, 'Ingrese un numero de correlativo')) {
                    searchAction();
                  }
              }
            }
          />
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
      <Col span={24}>
        <Table 
          loading={fetching}
          size='small'
          style={{ width: '100%' }}
          rowKey={'rowNum'}
          dataSource={[...entitydata, { customerFullname: 'TOTAL', total: getDataSumByProperty('total'), saleTotalPaid: getDataSumByProperty('saleTotalPaid') }] || []}
          columns= {[
            // columnDef({title: 'Id', dataKey: 'id'}),
            columnDef({title: 'Código', dataKey: 'id'}),
            columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
            columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-'}),
            columnDef({title: 'Fecha', dataKey: 'docDatetime'}),
            columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
            // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
            columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
            columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 }),
            // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
            columnMoneyDef({title: 'Total', dataKey: 'total', showDefaultString: true }),
            columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid'}),
            columnActionsDef(
              {
                title: 'Acciones',
                dataKey: 'id',
                edit: false,
                detailAction: (value) => {
                  setEntitySelectedId(value);
                  setOpenPreview(true);
                },
              }
            ),
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
        allowActions={true}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) loadData();
        }}
      />
    </Row>
  );
}

export default IssuedSalesByDocNumber;

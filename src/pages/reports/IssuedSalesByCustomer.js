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
import { validateBooleanExpression, validateSelectedData, validateStringData } from '../../utils/ValidateData';
import download from 'downloadjs';
import salesServices from '../../services/SalesServices';
import { GAddFileIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';
import SalePreview from '../../components/previews/SalePreview';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function IssuedSalesByCustomer() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [startDateFilter, setStartDateFilter] = useState(defaultDate());
  const [endDateFilter, setEndDateFilter] = useState(defaultDate());
  // const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
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
      // const docTypesRes = await generalsServices.findDocumentTypes();

      setLocationsData(locRes.data);
      // setDocumentTypesData(docTypesRes.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function searchAction() {
    setFetching(true);
    try {
      const res = await salesServices.findByCustomerIdentifier(
        customerIdentifier,
        startDateFilter.format('YYYY-MM-DD'),
        endDateFilter.format('YYYY-MM-DD')
      );
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
      const res = await salesServices.pdfDocs.findByCustomerIdentifier(
        customerIdentifier,
        startDateFilter.format('YYYY-MM-DD'),
        endDateFilter.format('YYYY-MM-DD')
      );
      download(res.data, `ReporteVentasEmitidasPorCliente.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchExcelReport() {
    setFetching(true);
    try {
      const res = await salesServices.excelDocs.findByCustomerIdentifier(
        customerIdentifier,
        startDateFilter.format('YYYY-MM-DD'),
        endDateFilter.format('YYYY-MM-DD')
      );
      download(res.data, `ReporteVentasEmitidasPorCliente.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  // function getDocumentTypeIcon(type, size = '36px') {
  //   switch(type) {
  //     case 1: return <GTicketIcon width={size} />;
  //     case 2: return <GInvoice2Icon width={size} />;
  //     case 3: return <GInvoiceTax2Icon width={size} />;
  //     case 4: return <GCreditNoteIcon width={size} />;
  //     case 5: return <GDebitNoteIcon width={size} />;
  //     default: return <GAddFileIcon width={size} />;
  //   }
  // }

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
          subTitle={`Búsqueda por Cliente`}
          extra={[
            <Button
              icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
              onClick={() => {
                // loadData();
                if (
                  validateStringData(customerIdentifier, 'Ingrese ID o código de cliente')
                  && validateBooleanExpression(startDateFilter?.isValid(), 'Ingrese una fecha de inicio para búsqueda')
                  && validateBooleanExpression(endDateFilter?.isValid(), 'Ingrese una fecha fin para búsqueda')
                ) {
                  fetchExcelReport();
                }
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
                if (
                  validateStringData(customerIdentifier, 'Ingrese ID o código de cliente')
                  && validateBooleanExpression(startDateFilter?.isValid(), 'Ingrese una fecha de inicio para búsqueda')
                  && validateBooleanExpression(endDateFilter?.isValid(), 'Ingrese una fecha fin para búsqueda')
                ) {
                  fetchPDFReport();
                }
              }}
              disabled={isEmpty(entitydata)}
            >
              Generar PDF
            </Button>
          ]}
        />
      </Col>
      <Col span={24}>
        <p style={{ margin: 0, fontSize: 12, color: '#434343' }}>Parámetros de búsqueda:</p>
        <Space>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Id - Codigo - Nombre</p>
            <Input 
              id='g-sale-doc-number-input'
              style={{ width: '100%' }} 
              placeholder={'Código o Id de Cliente'}
              value={customerIdentifier} 
              onChange={(e) => setCustomerIdentifier(e.target.value)}
              // onBlur={(e) => { validateDocNumber(); }}
              onKeyDown={
                (e) => {
                  if (e.key === 'Enter')
                    if (
                      validateStringData(customerIdentifier, 'Ingrese ID o código de cliente')
                      && validateBooleanExpression(startDateFilter?.isValid(), 'Ingrese una fecha de inicio para búsqueda')
                      && validateBooleanExpression(endDateFilter?.isValid(), 'Ingrese una fecha fin para búsqueda')
                    ) {
                      searchAction();
                    }
                }
              }
            />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Fecha de fin:</p>
            <DatePicker
              locale={locale}
              allowClear={false}
              format="DD MMMM YYYY"
              picker='day'
              value={startDateFilter}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setStartDateFilter(datetimeMoment);
              }}
            />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Fecha fin:</p>
            <DatePicker 
              locale={locale}
              allowClear={false}
              format="DD MMMM YYYY"
              picker='day'
              value={endDateFilter}
              style={{ width: '100%' }}
              onChange={(datetimeMoment, datetimeString) => {
                setEndDateFilter(datetimeMoment);
              }}
            />
          </div>
          <div>          
            <p style={{ margin: 0, fontSize: 10, color: '#ffffff' }}>-</p>
            <Button
              icon={<SearchOutlined />}
              loading={fetching}
              onClick={() => {
                if (
                  validateStringData(customerIdentifier, 'Ingrese ID o código de cliente')
                  && validateBooleanExpression(startDateFilter?.isValid(), 'Ingrese una fecha de inicio para búsqueda')
                  && validateBooleanExpression(endDateFilter?.isValid(), 'Ingrese una fecha fin para búsqueda')
                ) {
                  searchAction();
                }
              }}
            >
              Buscar
            </Button>
          </div>
          {/* <Button
            icon={<FilePdfTwoTone twoToneColor={'red'} />}
            onClick={async (e) => {
              setFetching(true);
              try {
                if (
                  validateSelectedData(locationSelectedId, 'Seleccione una sucursal')
                  // && validateSelectedData(cashierSelectedId, 'Seleccione una caja')
                  // && validateSelectedData(documentTypeSelectedId, 'Seleccione un tipo de documento')
                ) {
                  const res = await reportsServices.getMonthlyPurchaseBookPDF(
                    locationSelectedId,
                    // cashierSelectedId,
                    // documentTypeSelectedId,
                    monthFilter.format('YYYY-MM')
                  );

                  download(res.data, `LibroCompras${locationsData.find(x => x.id === locationSelectedId)?.name || ''}${monthFilter.format('MM-YYYY')}.pdf`.replace(/ /g,''));  
                }
              } catch(error) {

              }
              setFetching(false);
            }}
            disabled={isEmpty(purchasesData)}
          >
            Imprimir PDF
          </Button> */}
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
            columnDef({title: 'Cod. Gen.', dataKey: 'generationCode', fSize: 11, applyShortener: true, shortenerQtyInit: 8, shortenerQtyEnd: 8}),
            columnDef({title: 'Num. Ctrl.', dataKey: 'controlNumber', fSize: 11, applyShortener: true, shortenerQtyInit: 15, shortenerQtyEnd: 6}),
            columnDef({title: 'Sello', dataKey: 'receptionStamp', fSize: 11, applyShortener: true}),
            columnDef({title: 'Tipo', dataKey: 'documentTypeName', fSize: 11}),
            // columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-', fSize: 11}),
            columnDef({title: 'Fecha', dataKey: 'docDatetime', fSize: 11}),
            columnDef({title: 'Cliente', dataKey: 'customerFullname', fSize: 11}),
            // columnDef({title: 'Sucursal', dataKey: 'locationName', fSize: 11}),
            columnDef({title: 'Pago', dataKey: 'paymentTypeName', fSize: 11}),
            columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 , fSize: 11}),
            // columnDef({title: 'Anulada', dataKey: 'isVoided', fSize: 11}),
            columnMoneyDef({title: 'Gravado', dataKey: 'taxableSubTotalWithoutTaxes', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'Exento', dataKey: 'noTaxableSubTotal', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'IVA', dataKey: 'ivaTaxAmount', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'Fovial', dataKey: 'fovialTaxAmount', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'Cotrans', dataKey: 'cotransTaxAmount', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'Total', dataKey: 'total', showDefaultString: true , fSize: 11}),
            columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid', fSize: 11}),
            columnActionsDef(
              {
                fSize: 11,
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

export default IssuedSalesByCustomer;

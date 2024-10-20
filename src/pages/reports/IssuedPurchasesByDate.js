import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import locationsService from '../../services/LocationsServices';
import { Badge, Button, Col, DatePicker, Descriptions, Input, Modal, PageHeader, Radio, Row, Select, Space, Table, Tabs, Tag } from 'antd';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { FileExcelTwoTone, FilePdfTwoTone, FileSearchOutlined, SearchOutlined, SyncOutlined, UpSquareOutlined, WarningOutlined } from '@ant-design/icons';
import { filter, forEach, isEmpty } from 'lodash';
import generalsServices from '../../services/GeneralsServices';
import reportsServices from '../../services/ReportsServices';
import { columnActionsDef, columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef, columnNumberDef } from '../../utils/ColumnsDefinitions';
import { validateSelectedData, validateStringData } from '../../utils/ValidateData';
import download from 'downloadjs';
import salesServices from '../../services/SalesServices';
import { GAddFileIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';
import SalePreview from '../../components/previews/SalePreview';
import cashiersServices from '../../services/CashiersServices';
import { customNot } from '../../utils/Notifications';
import dteServices from '../../services/DteServices';
import { filterData } from '../../utils/Filters';
import productPurchasesServices from '../../services/ProductPurchasesServices';
import ProductPurchasePreview from '../../components/previews/ProductPurchasePreview';
import rawMaterialPurchasesServices from '../../services/RawMaterialPurchasesServices';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;
const { Search } = Input;

function IssuedPurchasesByDate() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  // const [customerIdentifier, setCustomerIdentifier] = useState(0);
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  // const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  // const [locationSelectedId, setLocationSelectedId] = useState(0);
  const [locationSelectedId, setLocationSelectedId] = useState(0);
  const [purchasesFilter, setPurchasesFilter] = useState('');

  const [filterPendingToTransmit, setFilterPendingToTransmit] = useState(false);
  const [filterInContingency, setFilterInContingency] = useState(false);
  const [filterVoided, setFilterVoided] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entityRmpData, setEntityRmpData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [entityRmpSelectedId, setEntityRmpSelectedId] = useState(0);
  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

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
      if (monthFilter.isValid()) {
        const res = await productPurchasesServices.findByLocationMonth(locationSelectedId, monthFilter.format('YYYY-MM'));
        const res1 = await rawMaterialPurchasesServices.findByLocationMonth(locationSelectedId, monthFilter.format('YYYY-MM'));
        console.log(res.data);
        setEntityData(res.data);
        console.log(res1.data);
        setEntityRmpData(res1.data);
        // document.getElementById('g-sale-doc-number-input').focus();
        // document.getElementById('g-sale-doc-number-input').select();
      } else {
        customNot('warning', 'Seleccione una caja y una fecha para buscar', '');
      }
    } catch(err) {
      console.log(err);
    }
    setFetching(false);
  }

  function getPendingToTransmit() {
    let total = 0;
    forEach(entityData, (value) => {
      if (value.dteTransmitionStatus === 1) total++;
    });
    return total || 0;
  }

  function getInContingency() {
    let total = 0;
    forEach(entityData, (value) => {
      if (value.dteTransmitionStatus === 3) total++;
    });
    return total || 0;
  }

  function getVoided() {
    let total = 0;
    forEach(entityData, (value) => {
      if (value.dteTransmitionStatus === 5) total++;
    });
    return total || 0;
  }

  async function retransmitPendingToTransmit() {
    setFetching(true);
    for (const value of entityData) {
      // console.log('EnTRANDO', value);
      if (value.dteTransmitionStatus === 1) {
        if (value.documentTypeId === 2) {
          try {
            customNot('info', `Transmitiendo Factura ${value.generationCode}...`, '', 5);
            await dteServices.signCF(value.id);
            // customNot('info', '', 'Enviando DTE Factura al email del cliente');
            // await dteServices.sendEmailCF(value.id);
          } catch(err) {
            customNot('error', `No se ha podido transmitir Factura ${value.generationCode}...`, '', 5);
          }
        }
        if (value.documentTypeId === 3) {
          try {
            customNot('info', `Transmitiendo Comp. Cred. Fiscal ${value.generationCode}...`, '', 5);
            await dteServices.signCCF(value.id);
            // customNot('info', '', 'Enviando DTE Comp. Cred. Fiscal al email del cliente');
            // await dteServices.sendEmailCCF(value.id);
          } catch(err) {
            customNot('error', `No se ha podido transmitir Comp. Cred. Fiscal ${value.generationCode}...`, '', 5);
          }
        }
      }
    }
    customNot('info', `Actualizando informacion de las ventas`, '', 3);
    searchAction().then(() =>  {
      setFetching(false);
    }).catch((error) => {
      setFetching(false);
    });
  }

  // async function fetchPDFReport() {
  //   setFetching(true);
  //   try {
  //     const res = await salesServices.pdfDocs.findByCustomerIdentifier(customerIdentifier);
  //     download(res.data, `ReporteVentasEmitidasPorCliente.pdf`);
  //   } catch(error) {
  //     console.log(error);
  //   }
  //   setFetching(false);
  // }

  // async function fetchExcelReport() {
  //   setFetching(true);
  //   try {
  //     const res = await salesServices.excelDocs.findByCustomerIdentifier(customerIdentifier);
  //     download(res.data, `ReporteVentasEmitidasPorCliente.xlsx`);
  //   } catch(error) {
  //     console.log(error);
  //   }
  //   setFetching(false);
  // }

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
    forEach(filterData(dataByFilters(), purchasesFilter, ['supplierName']), (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  function dataByFilters() {
    let data = [...entityData, ...entityRmpData];
    data.sort((a, b) => new Date(a.documentDatetime) - new Date(b.documentDatetime));
    if (filterPendingToTransmit) return data.filter(x => x.dteTransmitionStatus === 1);
    if (filterInContingency) return data.filter(x => x.dteTransmitionStatus === 3);
    else return data;
  }

  return (
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col span={24}>
        <PageHeader
          onBack={() => null}
          backIcon={<FileSearchOutlined />}
          title={`Compras Registradas`}
          subTitle={`Búsqueda por Mes`}
          // extra={[
          //   <Button
          //     icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
          //     onClick={() => {
          //       // loadData();
          //       // fetchExcelReport();
          //     }}
          //     loading={fetching}
          //     // disabled={isEmpty(entityData)}
          //     disabled
          //   >
          //     Generar Excel
          //   </Button>,
          //   <Button
          //     icon={<FilePdfTwoTone twoToneColor={'#f5222d'} />}
          //     onClick={() => {
          //       // loadData();
          //       // fetchPDFReport();
          //     }}
          //     // disabled={isEmpty(entityData)}
          //     disabled
          //   >
          //     Generar PDF
          //   </Button>
          // ]}
        />
      </Col>
      <Col span={24}>
        <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Parámetros de búsqueda:</p>
        <p style={{ margin: 0, marginBottom: 5, fontSize: 12, color: '#434343' }}>Seleccione una sucursal, determine una fecha y buscar</p>
        <Space>
          {/* <Input 
            id='g-sale-doc-number-input'
            style={{ width: '100%' }} 
            placeholder={'Código o Id de Cliente'}
            value={customerIdentifier} 
            onChange={(e) => setCustomerIdentifier(e.target.value)}
            // onBlur={(e) => { validateDocNumber(); }}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter')
                  if (validateStringData(customerIdentifier, 'Ingrese un numero de correlativo')) {
                    searchAction();
                  }
              }
            }
          /> */}
          <Select 
            dropdownStyle={{ width: '250px' }} 
            style={{ width: '250px' }} 
            value={locationSelectedId} 
            onChange={(value) => setLocationSelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (locationsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
          <DatePicker 
            locale={locale}
            allowClear={false}
            format="MMMM-YYYY"
            picker='month'
            value={monthFilter}
            style={{ width: '100%' }}
            onChange={(datetimeMoment, datetimeString) => {
              setMonthFilter(datetimeMoment);
            }}
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
        <Search
          name={'purchasesFilter'}
          value={purchasesFilter} 
          placeholder="Nombre de proveedor" 
          allowClear 
          style={{ width: 300 }}
          onChange={(e) => setPurchasesFilter(e.target.value)}
        />
      </Col>
      <Col span={24}>
        <Table 
          loading={fetching}
          size='small'
          style={{ width: '100%' }}
          rowKey={'identifier'}
          dataSource={[
            ...filterData(dataByFilters(), purchasesFilter, ['supplierName']),
            {
              supplierName: 'TOTAL',
              total: getDataSumByProperty('total'),
              purchaseTotalPaid: getDataSumByProperty('purchaseTotalPaid')
            }
          ] || []}
          columns= {[
            // columnDef({title: 'Id', dataKey: 'id'}),
            // columnDef({title: 'PType', dataKey: 'purchaseType'}),
            columnDef({title: 'Cód Int.', dataKey: 'id'}),
            columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
            columnDef({title: 'N° Doc', dataKey: 'documentNumber', ifNull: '-'}),
            columnDef({title: 'Fecha', dataKey: 'documentDatetime'}),
            columnDef({title: 'Proveedor', dataKey: 'supplierName'}),
            // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
            columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
            columnMoneyDef({title: 'Total', dataKey: 'total', showDefaultString: true }),
            columnMoneyDef({title: 'Pagado', dataKey: 'purchaseTotalPaid'}),
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
              },
              style: {
                background: record.purchaseType === 'pp' ? '#e6f4ff' :  record.purchaseType === 'rmp' ? '#efdbff' : 'inherit',
                // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
              }
            };
          }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'] }}
          // pagination={false}
        />
      </Col>
      <ProductPurchasePreview
        open={openPreview}
        productPurchaseId={entitySelectedId}
        allowActions={true}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) {
            // loadData();
            searchAction();
          }
        }}
      />
    </Row>
  );
}

export default IssuedPurchasesByDate;

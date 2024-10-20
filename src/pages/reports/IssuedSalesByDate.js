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
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;
const { Search } = Input;

function IssuedSalesByDate() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  // const [customerIdentifier, setCustomerIdentifier] = useState(0);
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  // const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  // const [locationSelectedId, setLocationSelectedId] = useState(0);
  const [cashierSelectedId, setCashierSelectedId] = useState(0);
  const [salesFilter, setSalesFilter] = useState('');

  const [filterPendingToTransmit, setFilterPendingToTransmit] = useState(false);
  const [filterInContingency, setFilterInContingency] = useState(false);
  const [filterVoided, setFilterVoided] = useState(false);

  const [entitydata, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [cashiersData, setCashiersData] = useState([]);

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
      const cashierRes = await cashiersServices.find();
      // const docTypesRes = await generalsServices.findDocumentTypes();

      setLocationsData(locRes.data);
      setCashiersData(cashierRes.data);
      // setDocumentTypesData(docTypesRes.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function searchAction() {
    setFetching(true);
    try {
      if (cashierSelectedId !== 0 && monthFilter.isValid()) {
        const res = await salesServices.findByCashierDate(cashierSelectedId, monthFilter.format('YYYY-MM-DD'));
        setEntityData(res.data);
        document.getElementById('g-sale-doc-number-input').focus();
        document.getElementById('g-sale-doc-number-input').select();
      } else {
        customNot('warning', 'Seleccione una caja y una fecha para buscar', '');
      }
    } catch(err) {
    
    }
    setFetching(false);
  }

  function getPendingToTransmit() {
    let total = 0;
    forEach(entitydata, (value) => {
      if (value.dteTransmitionStatus === 1) total++;
    });
    return total || 0;
  }

  function getInContingency() {
    let total = 0;
    forEach(entitydata, (value) => {
      if (value.dteTransmitionStatus === 3) total++;
    });
    return total || 0;
  }

  function getVoided() {
    let total = 0;
    forEach(entitydata, (value) => {
      if (value.dteTransmitionStatus === 5) total++;
    });
    return total || 0;
  }

  async function retransmitPendingToTransmit() {
    setFetching(true);
    for (const value of entitydata) {
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
    forEach(filterData(dataByFilters(), salesFilter, ['customerFullname']), (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  function dataByFilters() {
    if (filterPendingToTransmit) return entitydata.filter(x => x.dteTransmitionStatus === 1);
    if (filterInContingency) return entitydata.filter(x => x.dteTransmitionStatus === 3);
    if (filterVoided) return entitydata.filter(x => x.dteTransmitionStatus === 5);
    else return entitydata;
  }

  return (
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col span={24}>
        <PageHeader
          onBack={() => null}
          backIcon={<FileSearchOutlined />}
          title={`Ventas Emitidas`}
          subTitle={`Búsqueda por Fecha`}
          extra={[
            <Button
              icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
              onClick={() => {
                // loadData();
                // fetchExcelReport();
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
                // fetchPDFReport();
              }}
              disabled={isEmpty(entitydata)}
            >
              Generar PDF
            </Button>
          ]}
        />
      </Col>
      <Col span={24}>
        <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Parámetros de búsqueda:</p>
        <p style={{ margin: 0, marginBottom: 5, fontSize: 12, color: '#434343' }}>Seleccione una caja, determine una fecha y buscar</p>
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
            value={cashierSelectedId} 
            onChange={(value) => setCashierSelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (cashiersData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
          <DatePicker 
            locale={locale}
            allowClear={false}
            format="DD-MMMM-YYYY"
            picker='day'
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
          <Button
              style={{
                margin: '10px 5px'
              }}
              icon={<UpSquareOutlined />}
              loading={fetching}
              disabled={fetching || getPendingToTransmit() === 0}
              onClick={() => {
                Modal.confirm({
                  title: '¿Iniciar proceso de políticas de reintentos para todos los pendientes de transmisión?',
                  icon: <WarningOutlined />,
                  content: 'Esto puede tomar varios segundos o incluso minutos',
                  okText: 'Ejecutar transmisión',
                  cancelText: 'Cancelar',
                  onOk() {
                    retransmitPendingToTransmit();
                  },
                  onCancel() {},
                });
              }}
            >
              Transmitir pendientes
            </Button>
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
        <Space size='large'>
          <Tag
            color={(filterVoided || filterInContingency || filterPendingToTransmit) ? 'blue' : '#1677ff'}
            style={{
              cursor: 'pointer'
            }}
            onClick={() => {
              setFilterVoided(false);
              setFilterInContingency(false);
              setFilterPendingToTransmit(false);
            }}
          >
            TODAS
          </Tag>
          <Badge count={getVoided()} showZero>
            <Tag
              color={filterVoided ? '#f5222d' : 'red'}
              style={{
                cursor: 'pointer'
              }}
              onClick={() => {
                if(filterVoided) {
                  setFilterVoided(false);
                } else {
                  setFilterVoided(true);
                  setFilterInContingency(false);
                  setFilterPendingToTransmit(false);
                }
              }}
            >
              INVALIDADAS
            </Tag>
          </Badge>
          <Badge count={getInContingency()} showZero>
            <Tag
              color={filterInContingency ? '#fa8c16' : 'volcano'}
              style={{
                cursor: 'pointer'
              }}
              onClick={() => {
                if(filterInContingency) {
                  setFilterInContingency(false);
                } else {
                  setFilterVoided(false);
                  setFilterInContingency(true);
                  setFilterPendingToTransmit(false);
                }
              }}
            >
              CONTINGENCIA
            </Tag>
          </Badge>
          <Badge count={getPendingToTransmit()} showZero>
            <Tag
              color={filterPendingToTransmit ? '#eb2f96' : 'pink'}
              style={{
                cursor: 'pointer'
              }}
              onClick={() => {
                if(filterPendingToTransmit) {
                  setFilterPendingToTransmit(false);
                } else {
                  setFilterVoided(false);
                  setFilterInContingency(false);
                  setFilterPendingToTransmit(true);
                }
              }}
            >
              PENDIENTES TRANSMISION
            </Tag>
          </Badge>
        </Space>
      </Col>
      <Col span={24}>
        <Search
          name={'salesFilter'}
          value={salesFilter} 
          placeholder="Nombre de cliente" 
          allowClear 
          style={{ width: 300 }}
          onChange={(e) => setSalesFilter(e.target.value)}
        />
      </Col>
      <Col span={24}>
        <Table 
          loading={fetching}
          size='small'
          style={{ width: '100%' }}
          rowKey={'rowNum'}
          dataSource={[
            ...filterData(dataByFilters(), salesFilter, ['customerFullname']),
            {
              customerFullname: 'TOTAL',
              total: getDataSumByProperty('total'),
              saleTotalPaid: getDataSumByProperty('saleTotalPaid')
            }
          ] || []}
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
              },
              style: {
                background: record.dteTransmitionStatus === 1 ? '#ffd6e7' :  record.dteTransmitionStatus === 3 ? '#ffe7ba' : record.dteTransmitionStatus === 5 ? '#ffccc7' : 'inherit',
                // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
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
          if (wasVoided) {
            // loadData();
            searchAction();
          }
        }}
      />
    </Row>
  );
}

export default IssuedSalesByDate;

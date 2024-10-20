import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import locationsService from '../../services/LocationsServices';
import cashiersServices from '../../services/CashiersServices';
import { Button, Col, DatePicker, Descriptions, Radio, Row, Select, Space, Table, Tabs } from 'antd';
import { GAddFileIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { FilePdfTwoTone, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { filter, forEach, isEmpty } from 'lodash';
import generalsServices from '../../services/GeneralsServices';
import reportsServices from '../../services/ReportsServices';
import { columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef, columnNumberDef } from '../../utils/ColumnsDefinitions';
import { validateSelectedData } from '../../utils/ValidateData';
import download from 'downloadjs';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function PurchaseBooks() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  // const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  const [locationSelectedId, setLocationSelectedId] = useState(0);
  // const [cashierSelectedId, setCashierSelectedId] = useState(0);

  const [purchasesData, setPurchasesData] = useState([]);
  // const [documentTypesData, setDocumentTypesData] = useState([]);
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
      // const cashierRes = await cashiersServices.find();
      // const documentTypesResponse = await generalsServices.findDocumentTypes();

      setLocationsData(locRes.data);
      // setCashiersData(cashierRes.data);
      // setDocumentTypesData(documentTypesResponse.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function generatePurchaseBook() {
    setFetching(true);
    try {
      if (
        validateSelectedData(locationSelectedId, 'Seleccione una sucursal')
        // && validateSelectedData(cashierSelectedId, 'Seleccione una caja')
        // && validateSelectedData(documentTypeSelectedId, 'Seleccione un tipo de documento')
      ) {
        const purchaseRes = await reportsServices.getMonthlyPurchasesBook(
          locationSelectedId,
          // cashierSelectedId,
          // documentTypeSelectedId,
          monthFilter.format('YYYY-MM')
        );
  
        setPurchasesData(purchaseRes.data);
      }      
    } catch(error) {

    }
    setFetching(false);
  }

  function getDataSumByProperty(propertyName) {
    let total = 0;
    forEach(purchasesData, (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  const tabItems = [
    {
      label: 'Compras',
      key: 'item-1',
      children: <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              loadData();
              generatePurchaseBook();
            }}
          >
            Actualizar
          </Button>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Sucursal:`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={locationSelectedId} 
            onChange={(value) => {
              setLocationSelectedId(value);
              // setCashierSelectedId(0);
            }}
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
        </Col>
        {/* <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`En la caja:`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={cashierSelectedId} 
            onChange={(value) => {
              setCashierSelectedId(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
            disabled={locationSelectedId === 0 || locationSelectedId === null}
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (cashiersData.filter(x => x.locationId === locationSelectedId) || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col> */}
        {/* <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Tipo Documento:`}</p>
          <Radio.Group
            buttonStyle="solid"
            value={documentTypeSelectedId}
            onChange={(e) => {
              setDocumentTypeSelectedId(e.target.value);
            }}
          >
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
        </Col> */}
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Al mes:`}</p>
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
        </Col>
        <Col span={24}>
          <Space>
            <Button
              icon={<SearchOutlined />}
              onClick={() => {
                generatePurchaseBook();
              }}
            >
              Generar libro
            </Button>
            <Button
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
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <Table 
            loading={fetching}
            size='small'
            style={{ width: '100%' }}
            rowKey={'rowNum'}
            dataSource={[
              ...purchasesData,
              {
                reportDay: 'TOTALES',
                noTaxableSubTotal: getDataSumByProperty('noTaxableSubTotal'),
                noTaxableSubTotalImport: getDataSumByProperty('noTaxableSubTotalImport'),
                taxableSubTotal: getDataSumByProperty('taxableSubTotal'),
                taxableSubTotalImport: getDataSumByProperty('taxableSubTotalImport'),
                totalTaxes: getDataSumByProperty('totalTaxes'),
                total: getDataSumByProperty('total'),
                IVAretention: getDataSumByProperty('IVAretention'),
                totalExcludeIndividuals: getDataSumByProperty('totalExcludeIndividuals')
              }
            ]}
            columns={[
              columnDef({title: 'Correlativo', dataKey: 'rowNum', fSize: 10}),
              columnDef({title: 'Fecha Emision', dataKey: 'reportDay', ifNull: '-', fSize: 10}),
              columnDef({title: 'No. Factura', dataKey: 'documentNumber', ifNull: '-', fSize: 10}),
              columnDef({title: 'No. Registro', dataKey: 'supplierNrc', ifNull: '-', fSize: 10}),
              columnDef({title: 'Nombre del Proveedor', dataKey: 'supplierName', ifNull: '-', fSize: 10}),
              columnNumberDef({ title: 'Internas', dataKey: 'noTaxableSubTotal', ifNull: '0' , fSize: 10}),
              columnNumberDef({ title: 'Import.', dataKey: 'noTaxableSubTotalImport', ifNull: '0' , fSize: 10}),
              columnNumberDef({ title: 'Internas', dataKey: 'taxableSubTotal', ifNull: '0' , fSize: 10}),
              columnNumberDef({ title: 'Import.', dataKey: 'taxableSubTotalImport', ifNull: '0' , fSize: 10}),
              columnNumberDef({ title: 'Credito Fiscal', dataKey: 'totalTaxes', ifNull: '0' , fSize: 10}),
              columnNumberDef({ title: 'Total Compras', dataKey: 'total', ifNull: '0', fSize: 10 }),
              columnNumberDef({ title: 'Retencion Terceros', dataKey: 'IVAretention', ifNull: '0', fSize: 10 }),
              columnNumberDef({ title: 'Compras Sujetos Excluidos', dataKey: 'totalExcludeIndividuals', ifNull: '0', fSize: 10 })
            ]}
            pagination={{ defaultPageSize: 200, showSizeChanger: true, pageSizeOptions: ['200', '500', '1000'] }}
          />
        </Col>
        <Col span={12} style={{ backgroundColor: '#FAFAFA' }}>
          <Descriptions
            bordered
            labelStyle={{ fontSize: 11, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
            contentStyle={{ fontSize: 13, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
            style={{ width: '100%' }}
            size={'small'}
          >
            <Descriptions.Item label={`Compra Neta`} span={3}>{`${(getDataSumByProperty('total') - getDataSumByProperty('totalTaxes')).toFixed(2)}`}</Descriptions.Item>
            <Descriptions.Item label={`Credito Fiscal`} span={3}>{`${getDataSumByProperty('totalTaxes')}`}</Descriptions.Item>
            <Descriptions.Item label={`Compra Total`} span={3}>{`${getDataSumByProperty('total')}`}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    }
  ];

  return (
    <Wrapper>
      <Tabs
        type={'card'}
        items={tabItems}
      />
    </Wrapper>
  );
}

export default PurchaseBooks;

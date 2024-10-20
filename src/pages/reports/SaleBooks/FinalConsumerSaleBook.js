import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import locationsService from '../../../services/LocationsServices';
import { Button, Col, DatePicker, Descriptions, Radio, Row, Select, Space, Table, Tabs } from 'antd';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { FilePdfTwoTone, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { forEach, isEmpty } from 'lodash';
import reportsServices from '../../../services/ReportsServices';
import { columnDef, columnNumberDef } from '../../../utils/ColumnsDefinitions';
import { validateSelectedData } from '../../../utils/ValidateData';
import download from 'downloadjs';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function FinalConsumerSaleBook() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState();
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [locationSelectedId, setLocationSelectedId] = useState(0);

  const [salesData, setSalesData] = useState([[], []]);
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

      setLocationsData(locRes.data);
    } catch(err) {
    
    }
    setFetching(false);
  }
  
  useEffect(() => {
    if (state !== null) {
      // APPLY LOGIC FROM NAVIGATION PROPS
    }
  }, []);

  async function generateSaleBook() {
    setFetching(true);
    try {
      if (
        validateSelectedData(locationSelectedId, 'Seleccione una sucursal')
      ) {
        const saleRes = await reportsServices.getMonthlyFinalConsumerSaleBook(
          locationSelectedId,
          monthFilter.format('YYYY-MM')
        );

        console.log(saleRes.data)
  
        setSalesData(saleRes.data);
      }
    } catch(error) {

    }
    setFetching(false);
  }

  function getDataSumByProperty(propertyName, indexToSum) {
    let total = 0;
    forEach(salesData[indexToSum], (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  return (
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col span={24}>
        <Button
          icon={<SyncOutlined />}
          onClick={() => {
            loadData();
            generateSaleBook();
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
              generateSaleBook();
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
                ) {
                  const res = await reportsServices.getMonthlyFinalConsumerSaleBookPDF(
                    locationSelectedId,
                    monthFilter.format('YYYY-MM')
                  );

                  download(res.data, `LibroVentasConsumidor${locationsData.find(x => x.id === locationSelectedId)?.name || ''}${monthFilter.format('MM-YYYY')}.pdf`.replace(/ /g,''));  
                }
              } catch(error) {

              }
              setFetching(false);
            }}
            disabled={isEmpty(salesData)}
          >
            Imprimir PDF
          </Button>
        </Space>
      </Col>
      <Col
        span={24}
      >
        <Table 
          loading={fetching}
          size='small'
          style={{ width: '100%' }}
          rowKey={'rowNum'}
          dataSource={[
            ...salesData[0],
            {
              reportDay: 'TOTALES',
              noTaxableSubTotal: getDataSumByProperty('noTaxableSubTotal', 0),
              taxableSubTotal: getDataSumByProperty('taxableSubTotal', 0),
              ivaTaxAmount: getDataSumByProperty('ivaTaxAmount', 0),
              fovialTaxAmount: getDataSumByProperty('fovialTaxAmount', 0),
              cotransTaxAmount: getDataSumByProperty('cotransTaxAmount', 0),
              IVARetention: getDataSumByProperty('IVARetention', 0),
              IVAPerception: getDataSumByProperty('IVAPerception', 0),
              exportations: getDataSumByProperty('exportations', 0),
              total: getDataSumByProperty('total', 0),
              totalToThirdAccounts: getDataSumByProperty('totalToThirdAccounts', 0),
            }
          ]}
          columns={[
            columnDef({title: 'Dia', dataKey: 'reportDay', fSize: 9}),
            columnDef({title: 'Del No.', dataKey: 'documentNumberFrom', ifNull: '-', fSize: 9}),
            columnDef({title: 'Al No.', dataKey: 'documentNumberTo', ifNull: '-', fSize: 9}),
            columnDef({title: 'Serie', dataKey: 'serie', ifNull: '-', fSize: 9}),
            columnDef({title: 'Caja o Sitema Comp.', dataKey: 'cashierId', ifNull: '-', fSize: 9}),
            columnNumberDef({ title: 'Exentas', dataKey: 'noTaxableSubTotal', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'Gravadas', dataKey: 'taxableSubTotal', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'IVA', dataKey: 'ivaTaxAmount', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'FOVIAL', dataKey: 'fovialTaxAmount', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'Cotrans', dataKey: 'cotransTaxAmount', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'IVA Retenido', dataKey: 'IVARetention', ifNull: '0', fSize: 9 }),
            columnNumberDef({ title: 'IVA Percibido', dataKey: 'IVAPerception', ifNull: '0', fSize: 9 }),
            columnNumberDef({ title: 'Exportaciones', dataKey: 'exportations', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'Total Ventas Diarias Propias', dataKey: 'total', ifNull: '0' , fSize: 9}),
            columnNumberDef({ title: 'Venta a Cta de Terceros', dataKey: 'totalToThirdAccounts', ifNull: '0' , fSize: 9}),
          ]}
          pagination={{ defaultPageSize: 200, showSizeChanger: true, pageSizeOptions: ['200', '500', '1000'] }}
          scroll={{
            // x: 3000, y: 300
          }}
        />
      </Col>
      <Col
        span={12}
        style={{
          backgroundColor: '#FAFAFA',
          border: '1px solid #d9d9d9',
          borderRadius: 5,
          boxShadow: '3px 3px 5px 0px #d9d9d9',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10
        }}
      >
        <p style={{ margin: '5px 0px', fontSize: 12 }}>{`Resumen Libro Ventas al Consumidor`}</p>
        <p style={{ margin: '5px 0px', fontSize: 14 }}>{`GENERAL`}</p>
        <p style={{ margin: '5px 0px', fontSize: 14, fontWeight: 600 }}>{`${monthFilter.format('MMMM YYYY')}`}</p>
        <Descriptions
          bordered
          labelStyle={{ fontSize: 11, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
          contentStyle={{ fontSize: 13, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
          style={{ width: '100%' }}
          size={'small'}
        >
          <Descriptions.Item label={`TOTAL EXENTA`} span={3}>{`$${Number(getDataSumByProperty('noTaxableSubTotal', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`TOTAL GRAVADA`} span={3}>{`$${Number(getDataSumByProperty('taxableSubTotal', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`IVA`} span={3}>{`$${Number(getDataSumByProperty('ivaTaxAmount', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`FOVIAL`} span={3}>{`$${Number(getDataSumByProperty('fovialTaxAmount', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`COTRANS`} span={3}>{`$${Number(getDataSumByProperty('cotransTaxAmount', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`IVA RETENIDO`} span={3}>{`$${Number(getDataSumByProperty('IVAretention', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`IVA PERCIBIDO`} span={3}>{`$${Number(getDataSumByProperty('IVAperception', 0)).toFixed(2)}`}</Descriptions.Item>
          <Descriptions.Item label={`TOTAL`} span={3}>{`$${Number(getDataSumByProperty('total', 0)).toFixed(2)}`}</Descriptions.Item>
        </Descriptions>
      </Col>
      {
        (salesData[1]).map((_item, _index) => (
          <Col
            span={12}
            style={{
              backgroundColor: `${_item?.summaryBgColor}`,
              border: '1px solid #d9d9d9',
              borderRadius: 5,
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 10,
              paddingRight: 10
            }}
          >
            <p style={{ margin: '5px 0px', fontSize: 12 }}>{`Resumen Libro Ventas al Consumidor`}</p>
            <p style={{ margin: '5px 0px', fontSize: 14 }}>{`${_item?.summaryDescription}`}</p>
            <p style={{ margin: '5px 0px', fontSize: 14, fontWeight: 600 }}>{`${monthFilter.format('MMMM YYYY')}`}</p>
            <Descriptions
              bordered
              labelStyle={{ fontSize: 11, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 13, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              style={{ width: '100%', margin: '5px 0px' }}
              size={'small'}
            >
              <Descriptions.Item label={`TOTAL EXENTA`} span={3}>{`$${Number(_item?.noTaxableSubTotal).toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label={`TOTAL GRAVADA`} span={3}>{`$${Number(_item?.taxableSubTotal).toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label={`IVA`} span={3}>{`$${Number(_item?.ivaTaxAmount).toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label={`FOVIAL`} span={3}>{`$${Number(_item?.fovialTaxAmount).toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label={`COTRANS`} span={3}>{`$${Number(_item?.cotransTaxAmount).toFixed(2)}`}</Descriptions.Item>
              {/* <Descriptions.Item label={`IVA PERCIBIDO`} span={3}>{`$${Number(_item?.IVAperception).toFixed(2)}`}</Descriptions.Item> */}
              {/* <Descriptions.Item label={`IVA RETENIDO`} span={3}>{`$${Number(_item?.IVAretention).toFixed(2)}`}</Descriptions.Item> */}
              <Descriptions.Item label={`TOTAL`} span={3}>{`$${Number(_item?.total).toFixed(2)}`}</Descriptions.Item>
            </Descriptions>
          </Col>
        ))
      }
    </Row>
  );
}

export default FinalConsumerSaleBook;

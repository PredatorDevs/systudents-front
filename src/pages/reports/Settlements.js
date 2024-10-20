import React, { useEffect, useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CompanyInformation } from '../../styled-components/CompanyInformation';
import { Button, Col, Input, Row, Select, Space, Table, Tabs } from 'antd';
import { TableContainer } from '../../styled-components/TableContainer';
import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';

import { FilePdfTwoTone, LogoutOutlined, PrinterFilled } from '@ant-design/icons';
import { customNot } from '../../utils/Notifications';
import { filterData } from '../../utils/Filters';
import shiftcutsService from '../../services/ShiftcutsServices';

import { BlobProvider } from '@react-pdf/renderer';
import SettlementPDF from '../../components/reports/SettlementPDF';
import { includes } from 'lodash';
import { getUserLocation, getUserRole } from '../../utils/LocalData';
import LocationSelector from '../../components/selectors/LocationSelector';
import reportsServices from '../../services/ReportsServices';
import download from 'downloadjs';
import cashiersServices from '../../services/CashiersServices';
import locationsService from '../../services/LocationsServices';
import SettlementX from './Settlements/SettlementX';
import SettlementZ from './Settlements/SettlementZ';

const { Option } = Select;
const { Search } = Input;

function Settlements() {
  const navigate = useNavigate();

  const [locationsData, setLocationsData] = useState([]);
  const [locationSelectedId, setLocationSelectedId] = useState(getUserLocation());
  const [cashiersData, setCashiersData] = useState([]);
  const [cashierSelectedId, setCashierSelectedId] = useState(0);

  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [entityData, setEntityData] = useState([]);
  // const [locationSelected, setLocationSelected] = useState(getUserLocation());
  
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const locRes = await locationsService.find();
      const casRes = await cashiersServices.find();

      setLocationsData(locRes.data);
      setCashiersData(casRes.data);
    } catch(error) {

    }
  }

  const tabItems = [
    {
      label: 'Cortes X',
      key: 'item-1',
      children: <SettlementX
        locationId={locationSelectedId}
        cashierId={cashierSelectedId}
      />
    },
    {
      label: 'Cortes Z',
      key: 'item-2',
      children: <SettlementZ
        locationId={locationSelectedId}
        cashierId={cashierSelectedId}
      />
    },
    // {
    //   label: 'Resúmenes',
    //   key: 'item-3',
    //   children: <></>
    // }
  ];
  
  // useEffect(() => {
  //   loadData(getUserLocation());
  // }, []);

  // async function loadData(locationId) {
  //   try {
  //     setFetching(true);
  //     const res = await shiftcutsService.settlementsByLocation(locationId);
  //     const cashiersResponse = await cashiersServices.find();
  //     setEntityData(res.data);
  //     setCashiersData(cashiersResponse.data);
  //     setFetching(false);
  //   } catch(err) {
  //     setFetching(false);
  //     console.log(err);
  //   }
  // }

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={12}>
          <p style={{ margin: '0px 0px 0px 0px' }}>Sucursal:</p>
          <Select 
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
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
        </Col>
        <Col span={12}>
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px 0px 0px 0px' }}>Caja:</p>
          <Select 
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
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
              (cashiersData.filter(x => x.locationId === locationSelectedId) || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={24}>
          <Tabs
            style={{ width: '100%' }}
            type={'card'}
            items={tabItems}
          />
        </Col>
      </Row>
      {/* <div style={{ display: 'none' }}>
        <BlobProvider
          document={<SettlementPDF reportData={entityDataToPrint} hellNo={counter} />}
        >
          {({ blob, url, loading, error }) => {
            // Do whatever you need with blob here
            return <a href={url} id={'print-settlement1-button'} target="_blank" rel="noreferrer">Open in new tab</a>;
          }}
        </BlobProvider>
      </div>
      <CompanyInformation>
        <section className='company-info-container'>
          <p className='module-name'>Liquidaciones</p>
        </section>
      </CompanyInformation>
      <Container>
        <InnerContainer>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Button loading={fetching} disabled={fetching} danger type={'primary'} icon={<LogoutOutlined />} onClick={() => navigate('/reports')}>Salir</Button> 
            </Col>
          </Row>
        </InnerContainer>
        <InnerContainer>
          <Search
            name={'filter'} 
            value={filter} 
            placeholder="" 
            allowClear 
            style={{ width: 300 }}
            onChange={(e) => setFilter(e.target.value)}
          />
          <p style={{ margin: 0, fontSize: 9 }}>Búsqueda por: Número - Cliente - Tipo - Estado</p>
          <div style={{ height: 10 }} />
          <TableContainer>
            <Table
              columns={
                [
                  columnDef({title: 'Número', dataKey: 'shiftcutNumber'}),
                  columnDef({title: 'Apertura', dataKey: 'openedAt'}),
                  columnDef({title: 'Cierre', dataKey: 'shiftcutDatetime'}),
                  columnMoneyDef({title: 'Inicial', dataKey: 'initialAmount'}),
                  columnMoneyDef({title: 'Final', dataKey: 'finalAmount'}),
                  columnMoneyDef({title: 'Remesado', dataKey: 'remittedAmount'}),
                  {
                    title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Opciones'}</p>,
                    dataIndex: 'id',
                    key: 'id',
                    align: 'right',
                    render: (text, record, index) => {
                      return (
                        <Space>
                          {
                            includes([1, 2, 3, 4], getUserRole()) ? 
                            <Button
                              type="primary"
                              size="small"
                              icon={<PrinterFilled />}
                              onClick={() => {
                                setFetching(true);
                                customNot('info', 'Generando reporte', 'Esto tomará unos segundos')
                                shiftcutsService.settlementsById(record.shiftcutId)
                                .then((response) => {
                                  setEntityDataToPrint(response.data);
                                  setCounter(counter + 1);
                                  setTimeout(() => {
                                    document.getElementById('print-settlement1-button').click();
                                    setFetching(false);
                                  }, 1000);
                                }).catch((error) => {
                                  customNot('error', 'Información de liquidación no encontrada', 'Revise conexión')
                                  setFetching(false);
                                });
                              }}
                            />
                             : <>
                            
                            </>
                          }
                        </Space>
                      )
                    }
                  },
                ]
              }
              rowKey={'shiftcutId'}
              dataSource={filterData(entityData, filter, ['shiftcutNumber']) || []}
              pagination
              size={'small'}
            />
          </TableContainer>
        </InnerContainer>
      </Container> */}
    </Wrapper>
  );
}

export default Settlements;

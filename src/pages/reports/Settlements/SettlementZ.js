import React, { useEffect, useState } from 'react';
import { Wrapper } from '../../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CompanyInformation } from '../../../styled-components/CompanyInformation';
import { Button, Col, DatePicker, Input, Result, Row, Select, Space, Table, Tabs } from 'antd';
import { TableContainer } from '../../../styled-components/TableContainer';
import { columnDef, columnMoneyDef } from '../../../utils/ColumnsDefinitions';

import { FilePdfTwoTone, LogoutOutlined, PrinterFilled, SearchOutlined } from '@ant-design/icons';
import { customNot } from '../../../utils/Notifications';
import { filterData } from '../../../utils/Filters';
import shiftcutsService from '../../../services/ShiftcutsServices';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { BlobProvider } from '@react-pdf/renderer';
import SettlementPDF from '../../../components/reports/SettlementPDF';
import { includes } from 'lodash';
import { getUserLocation, getUserRole } from '../../../utils/LocalData';
import LocationSelector from '../../../components/selectors/LocationSelector';
import reportsServices from '../../../services/ReportsServices';
import download from 'downloadjs';
import cashiersServices from '../../../services/CashiersServices';
import locationsService from '../../../services/LocationsServices';

const { Option } = Select;
const { Search } = Input;

function SettlementZ(props) {
  const { locationId, cashierId } = props;

  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [entityData, setEntityData] = useState([]);

  const [dateFilter, setDateFilter] = useState(defaultDate());

  function defaultDate() {
    return moment();
  };
  
  useEffect(() => {
    loadSettlementData();
  }, []);

  async function loadSettlementData() {
    try {
      setFetching(true);
      const res = await shiftcutsService.settlementsByLocationCashierMonthDate(locationId, cashierId, dateFilter.format('YYYY-MM'));
      setEntityData(res.data);
      setFetching(false);
    } catch(err) {
      setFetching(false);
      console.log(err);
    }
  }

  return (
    !((locationId !== null && locationId !== 0) && (cashierId !== null && cashierId !== 0)) ? <>
      <Result
        status="info"
        title={<p>{`Seleccione una sucursal y una caja`}</p>}
        subTitle={<p>{`Para buscar los cortes deseados primero debe proporcionar la información de búsqueda`}</p>}
      />
    </> :
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <>
              <p style={{ margin: '0px 0px 0px 0px' }}> {`Mes:`}</p>
              <DatePicker 
                locale={locale}
                allowClear={false}
                format="MMMM-YYYY"
                picker='month'
                value={dateFilter}
                style={{ width: '100%' }}
                onChange={(datetimeMoment, datetimeString) => {
                  setDateFilter(datetimeMoment);
                }}
              />
            </>
            <Button
              icon={<SearchOutlined/>}
              onClick={() => {
                loadSettlementData();
              }}
            />
          </Space>
          
        </Col>
        <Col span={24}>
          <Table
            columns={
              [
                // columnDef({title: 'Cod', dataKey: 'shiftcutId'}),
                columnDef({title: 'Caja', dataKey: 'cashierName'}),
                columnDef({title: 'Número Ini', dataKey: 'prevShiftcutNumber', ifNull: '0'}),
                columnDef({title: 'Número Fin', dataKey: 'lastShiftcutNumber', ifNull: '0'}),
                // columnDef({title: 'Apertura', dataKey: 'openedAt'}),
                // columnDef({title: 'Cierre', dataKey: 'closedAt'}),
                columnDef({title: 'Fecha', dataKey: 'closedAtFormatted'}),
                columnMoneyDef({title: 'Inicial', dataKey: 'initialAmount'}),
                columnMoneyDef({title: 'Final', dataKey: 'finalAmount'}),
                columnMoneyDef({title: 'Entregado', dataKey: 'remittedAmount'}),
                columnMoneyDef({title: 'Total Venta', dataKey: 'totalSale'}),
                {
                  title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Opciones'}</p>,
                  dataIndex: 'id',
                  key: 'id',
                  align: 'right',
                  render: (text, record, index) => {
                    return (
                      <Space>
                        <Button
                          icon={<FilePdfTwoTone twoToneColor={'blue'} />}
                          onClick={async (e) => {
                            setFetching(true);
                            try {
                              const res = await reportsServices.shiftcutZSettlement(record.closedAtFormatted, record.prevShiftcutId, record.lastShiftcutId);

                              download(res.data, `CorteZ-${record.closedAtFormatted}${record.cashierName}${record.locationName}.pdf`.replace(/ /g,''));
                            } catch(error) {

                            }
                            setFetching(false);
                          }}
                        >Ticket Z</Button>
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
            loading={fetching}
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

export default SettlementZ;

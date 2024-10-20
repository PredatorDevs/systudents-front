import React, { useEffect, useState } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Button, Col, DatePicker, Radio, Row, Space, Table, Tag } from 'antd';
import { columnDef } from '../utils/ColumnsDefinitions';
import transfersServices from '../services/TransfersServices';
import { getUserLocation, getUserRole } from '../utils/LocalData';
import { customNot } from '../utils/Notifications';
import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { BookOutlined, FilePdfTwoTone, PlusOutlined } from '@ant-design/icons';
import { filter, includes } from 'lodash';
import TransferPreview from '../components/previews/TransferPreview';
import reportsServices from '../services/ReportsServices';
import download from 'downloadjs';

const { RangePicker } = DatePicker;

function Transfers() {
  const navigate = useNavigate();

  function defaultDate() {
    return moment();
  };

  const [fetching, setFetching] = useState(false);
  const [transferTabToRender, setTransferTabToRender] = useState((getUserLocation() === 2 || getUserLocation() === 1) ? 2 : 1);
  // LAST SEARCH METHOD HACE REFERENCIA A SI FUE UNA BÚSQUEDA POR DEFECTO (1) O UNA BÚSQUEDA MANUAL (2)
  const [lastSearchMethod, setLastSearchMethod] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [transferAbleToConfirm, setTransferAbleToConfirm] = useState(false);

  const [incomingInitialDate, setIncomingInitialDate] = useState(defaultDate());
  const [incomingFinalDate, setIncomingFinalDate] = useState(defaultDate());
  const [incomingSearchOption, setIncomingSearchOption] = useState(1);
  const [incomingFilterStatusOption, setIncomingFilterStatusOption] = useState(0);

  const [outcomingInitialDate, setOutcomingInitialDate] = useState(defaultDate());
  const [outcomingFinalDate, setOutcomingFinalDate] = useState(defaultDate());
  const [outcomingSearchOption, setOutcomingSearchOption] = useState(1);
  const [outcomingFilterStatusOption, setOutcomingFilterStatusOption] = useState(0);

  const [incomingTransfersData, setIncomingTransfersData] = useState(false);
  const [outcomingTransfersData, setOutcomingTransfersData] = useState(false);

  const [transferIdSelected, setTransferIdSelected] = useState(0);

  async function loadData() {
    setFetching(true);
    try {
      const incRes = await transfersServices.incomingTransfers(getUserLocation());
      const outRes = await transfersServices.outcomingTransfers(getUserLocation());
      
      setIncomingTransfersData(incRes.data);
      setOutcomingTransfersData(outRes.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function searchIncomingTransfers() {
    setFetching(true);
    try {
      if (incomingSearchOption === 1) {
        const res = await transfersServices.incomingTransfersBySentAtRange(
          getUserLocation(),
          incomingInitialDate.format('YYYY-MM-DD'),
          incomingFinalDate.format('YYYY-MM-DD')
        );
        setIncomingTransfersData(res.data);
        setLastSearchMethod(2);
      } else if (incomingSearchOption === 2) {
        const res = await transfersServices.incomingTransfersByReceivedAtRange(
          getUserLocation(),
          incomingInitialDate.format('YYYY-MM-DD'),
          incomingFinalDate.format('YYYY-MM-DD')
        );
        setIncomingTransfersData(res.data);
        setLastSearchMethod(2);
      }
    } catch (error) {
      
    }
    setFetching(false);
  }

  async function searchOutcomingTransfers() {
    setFetching(true);
    try {
      if (outcomingSearchOption === 1) {
        const res = await transfersServices.outcomingTransfersBySentAtRange(
          getUserLocation(),
          outcomingInitialDate.format('YYYY-MM-DD'),
          outcomingFinalDate.format('YYYY-MM-DD')
        );
        setOutcomingTransfersData(res.data);
      } else if (outcomingSearchOption === 2) {
        const res = await transfersServices.outcomingTransfersByReceivedAtRange(
          getUserLocation(),
          outcomingInitialDate.format('YYYY-MM-DD'),
          outcomingFinalDate.format('YYYY-MM-DD')
        );
        setOutcomingTransfersData(res.data);
      }
    } catch(error) {

    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);
  
  function transferStatusColor(value) {
    switch(value) {
      case 1: return 'gold'; // Pendiente
      case 2: return 'cyan'; // En proceso
      case 3: return 'red'; // Rechazado
      case 4: return 'blue'; // Parcial
      case 5: return 'green'; // Aceptado
      default: return 'default';
    }
  }

  const incomingColumns = [
    columnDef({title: 'Cód', dataKey: 'transferId', fSize: 11}),
    columnDef({title: 'Fecha envío', dataKey: 'sentAt', fSize: 11}),
    columnDef({title: 'Proviene de', dataKey: 'originLocationName', ifNull: '-', fSize: 11}),
    columnDef({title: 'Enviado por', dataKey: 'sentByFullname', fSize: 11}),
    columnDef({title: 'Fecha recibido', dataKey: 'receivedAt', ifNull: 'Sin recibir', fSize: 11}),
    columnDef({title: 'Recibido por', dataKey: 'receivedByFullname', ifNull: 'Sin recibir', fSize: 11}),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Estado'}</p>,
      dataIndex: 'id',
      key: 'id',
      
      render: (text, record, index) => {
        return (
          <Tag style={{ fontSize: 11 }} color={transferStatusColor(record.status)}>{record.transferStatusName}</Tag>
        )
      }
    },
  ];

  const outcomingColumns = [
    columnDef({title: 'Cód', dataKey: 'transferId', fSize: 11}),
    columnDef({title: 'Fecha envío', dataKey: 'sentAt', fSize: 11}),
    columnDef({title: 'Enviado a', dataKey: 'destinationLocationName', ifNull: '-', fSize: 11}),
    columnDef({title: 'Enviado por', dataKey: 'sentByFullname', fSize: 11}),
    columnDef({title: 'Fecha recibido', dataKey: 'receivedAt', ifNull: 'Sin recibir', fSize: 11}),
    columnDef({title: 'Recibido por', dataKey: 'receivedByFullname', ifNull: 'Sin recibir', fSize: 11}),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Estado'}</p>,
      dataIndex: 'transferId',
      key: 'transferId',
      render: (text, record, index) => {
        return (
          <Tag style={{ fontSize: 11 }} color={transferStatusColor(record.status)}>{record.transferStatusName}</Tag>
        )
      }
    },
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'transferId',
      key: 'transferId',
      render: (text, record, index) => {
        return (
          <Button
            icon={<FilePdfTwoTone twoToneColor={'red'} />}
            loading={fetching}
            onClick={async (e) => {
              e.stopPropagation();
              setFetching(true);
              try {
                customNot('info', 'Generando hoja de traslado', 'Esto puede tardar unos segundos...');
                const downloadPDFRes = await reportsServices.getTransferSheet(record.transferId);
                download(downloadPDFRes.data, `HojaTraslado${record.transferId}-${moment().format('DDMMYYYY')}.pdf`.replace(/ /g,''));
                customNot('success', 'Hoja de traslado descargada', 'Acción terminada');
              } catch(error) {

              }
              setFetching(false);
            }}
          />
        )
      }
    },
  ];

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24} style={{
          // backgroundColor: element.isOpen ? "#d9f7be" : "#fafafa",
          boxShadow: '3px 3px 5px 0px #d9d9d9',
          border: '1px solid #d9d9d9',
          borderRadius: 5
        }}>
          <Space>
            <Button
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#52c41a', color: 'white', margin: 5 }}
              onClick={(e) => {
                navigate('/main/transfers/new');
              }}
              disabled={getUserLocation() !== 2 && getUserLocation() !== 1}
            >
              Nuevo Traslado
            </Button>
            <Button
              icon={<BookOutlined />}
              style={{
                display: includes([1, 2], getUserRole()) ? 'inline' : 'none',
                backgroundColor: '#722ed1',
                color: 'white',
                margin: 5
              }}
              onClick={(e) => {
                navigate('/main/transfers/rejecteds');
              }}
              disabled={!includes([1, 2], getUserRole())}
            >
              Administrar rechazos
            </Button>
          </Space>
        </Col>
        <Col span={12}>
          <Radio.Group buttonStyle="solid" onChange={(e) => setTransferTabToRender(e.target.value)} value={transferTabToRender}>
            <Radio.Button 
              value={1} 
              // disabled={getUserLocation() === 1}
            >
              Entrantes
            </Radio.Button>
            <Radio.Button 
              value={2} 
              // disabled={getUserLocation() !== 1}
            >
              Salientes
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={12}>
        </Col>
      </Row>
      <div style={{ height: 20 }} />
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        {
          transferTabToRender === 1 ? (
            <Col span={24}>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Radio.Group buttonStyle="solid" onChange={(e) => setIncomingSearchOption(e.target.value)} value={incomingSearchOption}>
                      <Radio.Button value={1}>Enviado</Radio.Button>
                      <Radio.Button value={2}>Recibido</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    <Space>
                      <RangePicker 
                        locale={locale} 
                        format={["DD-MM-YYYY", "DD-MM-YYYY"]}
                        value={[incomingInitialDate, incomingFinalDate]} 
                        // style={{ width: '100%' }}
                        onChange={([initialMoment, finalMoment], [initialString, finalString]) => {
                          setIncomingInitialDate(initialMoment);
                          setIncomingFinalDate(finalMoment);
                        }}
                      />
                      <Button
                        onClick={(e) => searchIncomingTransfers()}
                      >
                        Buscar
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <p className='label'>Estado:</p>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Radio.Group buttonStyle="solid" onChange={(e) => setIncomingFilterStatusOption(e.target.value)} value={incomingFilterStatusOption}>
                      <Radio.Button value={0}>Todos</Radio.Button>
                      <Radio.Button value={1}>Pendientes</Radio.Button>
                      <Radio.Button value={2}>En Proceso</Radio.Button>
                      <Radio.Button value={3}>Rechazados</Radio.Button>
                      <Radio.Button value={4}>Parciales</Radio.Button>
                      <Radio.Button value={5}>Aceptados</Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
                <p className='label'>Resultados:</p>
                {/* <TableContainer headColor={'#9e1068'}> */}
                  <Table 
                    columns={incomingColumns}
                    rowKey={'transferId'}
                    size={'small'}
                    dataSource={
                      incomingFilterStatusOption === 0 ? incomingTransfersData : filter(incomingTransfersData, ['status', incomingFilterStatusOption]) || []
                    }
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: (e) => {
                          setTransferIdSelected(record.transferId);
                          setTransferAbleToConfirm(true);
                          setOpenModal(true);
                        }
                      };
                    }}
                    loading={fetching}
                  />
                {/* </TableContainer> */}
                <p className='disclaimer'>Previo a una primera búsqueda se muestran los últimos 50 traslados</p>
            </Col>
          ) : (
            <Col span={24}>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Radio.Group buttonStyle="solid" onChange={(e) => setOutcomingSearchOption(e.target.value)} value={outcomingSearchOption}>
                      <Radio.Button value={1}>Enviado</Radio.Button>
                      <Radio.Button value={2}>Recibido</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    <Space>
                      <RangePicker 
                        locale={locale} 
                        format={["DD-MM-YYYY", "DD-MM-YYYY"]}
                        value={[outcomingInitialDate, outcomingFinalDate]} 
                        // style={{ width: '100%' }}
                        onChange={([initialMoment, finalMoment], [initialString, finalString]) => {
                          setOutcomingInitialDate(initialMoment);
                          setOutcomingFinalDate(finalMoment);
                        }}
                      />
                      <Button
                        onClick={(e) => searchOutcomingTransfers()}
                      >
                        Buscar
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <p className='label'>Estado:</p>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Radio.Group buttonStyle="solid" onChange={(e) => setOutcomingFilterStatusOption(e.target.value)} value={outcomingFilterStatusOption}>
                      <Radio.Button value={0}>Todos</Radio.Button>
                      <Radio.Button value={1}>Pendientes</Radio.Button>
                      <Radio.Button value={2}>En Proceso</Radio.Button>
                      <Radio.Button value={3}>Rechazados</Radio.Button>
                      <Radio.Button value={4}>Parciales</Radio.Button>
                      <Radio.Button value={5}>Aceptados</Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
                <p className='label'>Resultados:</p>
                {/* <TableContainer headColor={'#006d75'}> */}
                  <Table 
                    columns={outcomingColumns}
                    rowKey={'transferId'}
                    size={'small'}
                    dataSource={
                      outcomingFilterStatusOption === 0 ? outcomingTransfersData : filter(outcomingTransfersData, ['status', outcomingFilterStatusOption]) || []
                    }
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: (e) => { 
                          setTransferIdSelected(record.transferId);
                          setOpenModal(true);  
                        }, // click row
                        // onDoubleClick: (event) => {}, // double click row
                        // onContextMenu: (event) => {}, // right button click row
                        // onMouseEnter: (event) => {}, // mouse enter row
                        // onMouseLeave: (event) => {}, // mouse leave row
                      };
                    }}
                    loading={fetching}
                  />
                {/* </TableContainer> */}
                <p className='disclaimer'>Previo a una primera búsqueda se muestran los últimos 50 traslados</p>
            </Col>
          )
        }
      </Row>
      <TransferPreview
        open={openModal}
        ableToConfirm={transferAbleToConfirm}
        transferId={transferIdSelected}
        onClose={(refreshAfterClose) => {
          setOpenModal(false);
          setTransferAbleToConfirm(false);
          setTransferIdSelected(0);
          if (refreshAfterClose) {
            if (lastSearchMethod === 1) loadData();
            if (lastSearchMethod === 2) searchIncomingTransfers();
          }
        }}
      />
    </Wrapper>
  );
}

export default Transfers;

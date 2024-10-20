import { Col, Row, Button, Table, Space, Statistic, Card, Result, Badge, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
// import { useNavigate } from 'react-router-dom';
import { ApiTwoTone, BookOutlined, ClockCircleTwoTone, DollarOutlined, StopTwoTone, SyncOutlined, UpSquareOutlined, WarningOutlined } from '@ant-design/icons';
import { columnActionsDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../utils/ColumnsDefinitions';
import salesServices from '../services/SalesServices.js';
import SalePreview from '../components/previews/SalePreview';
import { getUserMyCashier } from '../utils/LocalData';
import { forEach } from 'lodash';
import cashiersServices from '../services/CashiersServices';
import dteServices from '../services/DteServices.js';
import { customNot } from '../utils/Notifications.js';

const { confirm } = Modal;

function Sales() {
  const [fetching, setFetching] = useState(false);
  const [ableToProcess, setAbleToProcess] = useState(false);
  const [filterPendingToTransmit, setFilterPendingToTransmit] = useState(false);
  const [filterInContingency, setFilterInContingency] = useState(false);
  const [filterVoided, setFilterVoided] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [entitySelectedId, setEntitySelectedId] = useState(0);

  // const navigate = useNavigate();

  async function checkIfAbleToProcess() {
    setFetching(true);
    try {
      const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());
  
      const { isOpen, currentShiftcutId } = response.data[0];
  
      if (isOpen === 1 && currentShiftcutId !== null) {
        setAbleToProcess(true);
        
        const response = await salesServices.findByMyCashier(getUserMyCashier());
        setEntityData(response.data);
      }
    } catch(error) {

    }
    setFetching(false);
  }

  async function loadData() {
    setFetching(true);
    try {
      const response = await salesServices.findByMyCashier(getUserMyCashier());
      setEntityData(response.data);
    } catch(error) {
    }
    setFetching(false);
  }

  useEffect(() => {
    checkIfAbleToProcess();
  }, []);

  const columns = [
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
    columnMoneyDef({title: 'Total', dataKey: 'total'}),
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
  ];

  function dataByFilters() {
    if (filterPendingToTransmit) return entityData.filter(x => x.dteTransmitionStatus === 1);
    if (filterInContingency) return entityData.filter(x => x.dteTransmitionStatus === 3);
    if (filterVoided) return entityData.filter(x => x.dteTransmitionStatus === 5);
    else return entityData;
  }

  function getCashSaleTotal() {
    let total = 0;
    forEach(entityData, (value) => {
      total += +value.saleTotalPaid
    });
    return total || 0;
  }

  function getCreditSaleTotal() {
    let total = 0;
    forEach(entityData, (value) => {
      total += (+value.total - +value.saleTotalPaid)
    });
    return total || 0;
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
            customNot('info', '', 'Enviando DTE Factura al email del cliente');
            await dteServices.sendEmailCF(value.id);
          } catch(err) {
            customNot('error', `No se ha podido transmitir Factura ${value.generationCode}...`, '', 5);
          }
        }
        if (value.documentTypeId === 3) {
          try {
            customNot('info', `Transmitiendo Comp. Cred. Fiscal ${value.generationCode}...`, '', 5);
            await dteServices.signCCF(value.id);
            customNot('info', '', 'Enviando DTE Comp. Cred. Fiscal al email del cliente');
            await dteServices.sendEmailCCF(value.id);
          } catch(err) {
            customNot('error', `No se ha podido transmitir Comp. Cred. Fiscal ${value.generationCode}...`, '', 5);
          }
        }
      }
    }
    customNot('info', `Actualizando informacion de las ventas`, '', 3);
    const response = await salesServices.findByMyCashier(getUserMyCashier());
    setEntityData(response.data);
    setFetching(false);
  }

  return (
    !ableToProcess ? <>
      <Result
        status="info"
        title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de venta limitadas"}`}</p>}
        subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
      />
    </> : <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              icon={<SyncOutlined />}
              onClick={() => loadData()}
              loading={fetching}
              // size={'large'}
              >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col
          span={24}
          style={{
            backgroundColor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}
        >
          {/* <Space wrap align='end'> */}
            <Card style={{ margin: '10px 5px', minWidth: 200 }}>
              <Statistic loading={fetching} title="Ventas" value={entityData.length} prefix={<BookOutlined />} />
            </Card>
            <Card style={{ margin: '10px 5px', minWidth: 200 }}>
              <Statistic loading={fetching} title="Total Contado" value={getCashSaleTotal()} precision={2} prefix={<DollarOutlined />} />
            </Card>
            <Card style={{ margin: '10px 5px', minWidth: 200 }}>
              <Statistic loading={fetching} title="Total Crédito" value={getCreditSaleTotal()} precision={2} prefix={<DollarOutlined />} />
            </Card>
            <Card
              style={{
                margin: '10px 5px',
                border: filterVoided ? '2px solid #f5222d' : '1px solid #ffccc7',
                minWidth: 200
              }}
              onClick={filterPendingToTransmit || filterInContingency ? null : () => setFilterVoided(!filterVoided)}
            >
              <Statistic loading={fetching} title="Invalidadas" value={getVoided()} prefix={<StopTwoTone twoToneColor={'#f5222d'} />} />
            </Card>
            <Card
              style={{
                margin: '10px 5px',
                border: filterInContingency ? '2px solid #fa8c16' : '1px solid #ffe7ba',
                minWidth: 200
              }}
              onClick={filterPendingToTransmit || filterVoided ? null : () => setFilterInContingency(!filterInContingency)}
            >
              <Statistic loading={fetching} title="En Contingencia" value={getInContingency()} prefix={<ApiTwoTone twoToneColor={'#fa8c16'} />} />
            </Card>
            <Card
              style={{
                margin: '10px 5px',
                border: filterPendingToTransmit ? '2px solid #eb2f96' : '1px solid #ffd6e7',
                minWidth: 200
              }}
              onClick={filterInContingency || filterVoided ? null : () => setFilterPendingToTransmit(!filterPendingToTransmit)}
            >
              <Statistic loading={fetching} title="Pendientes transmisión" value={getPendingToTransmit()} prefix={<ClockCircleTwoTone twoToneColor={'#eb2f96'} />} />
            </Card>
            <Button
              style={{
                margin: '10px 5px'
              }}
              icon={<UpSquareOutlined />}
              loading={fetching}
              disabled={fetching || getPendingToTransmit() === 0}
              onClick={() => {
                confirm({
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
          {/* </Space> */}
        </Col>
        <Col span={24}>
          <p style={{ fontWeight: 600, margin: '10px 0px 5px 0px' }}>Ventas del turno actual</p>
        </Col>
        <Col span={24}>
          <Table 
            columns={columns}
            rowKey={'id'}
            size={'small'}
            dataSource={dataByFilters() || []}
            loading={fetching}
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
          />
        </Col>
      </Row>
      <SalePreview
        open={openPreview}
        saleId={entitySelectedId}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default Sales;

import { Col, Row, Button, Table, Space, Statistic, Card, Result, Tooltip, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, DeleteTwoTone, DollarOutlined, ExportOutlined, FileOutlined, ImportOutlined, LogoutOutlined, PlusOutlined, RollbackOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';
import { TableContainer } from '../../styled-components/TableContainer';
import { columnActionsDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { customNot } from '../../utils/Notifications';
import { CompanyInformation } from '../../styled-components/CompanyInformation';
import salesServices from '../../services/SalesServices.js';
import SalePreview from '../../components/previews/SalePreview';
import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';
import { forEach } from 'lodash';
import cashiersServices from '../../services/CashiersServices';
import transfersServices from '../../services/TransfersServices.js';
import { GDebitNoteIcon, GRestoreIcon } from '../../utils/IconImageProvider.js';

const { confirm } = Modal;

function RejectedTransfers() {
  const [fetching, setFetching] = useState(false);
  const [ableToProcess, setAbleToProcess] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [entitySelectedId, setEntitySelectedId] = useState(0);

  const navigate = useNavigate();

  async function loadData() {
    setFetching(true);
    const response = await transfersServices.getRejecteds();

    setEntityData(response.data);
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    // columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Cod', dataKey: 'transferRejectedDetailId'}),
    columnDef({title: 'Traslado', dataKey: 'transferId'}),
    columnDef({title: 'Enviado desde', dataKey: 'originLocationName'}),
    columnDef({title: 'Enviado a', dataKey: 'destinationLocationName'}),
    columnDef({title: 'Descripcion', dataKey: 'productName'}),
    columnDef({title: 'Enviado', dataKey: 'quantityExpected'}),
    columnDef({title: 'Recibido', dataKey: 'quantityConfirmed'}),
    columnDef({title: 'Rechazado', dataKey: 'rejectedQuantity'}),
    columnDef({title: 'Estado', dataKey: 'rejectedDetailStatusName'}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'transferRejectedDetailId',
      key: 'transferRejectedDetailId',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Space style={{ display: record.rejectedDetailStatus === 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'flex-end' }} size={'small'}>
            <Tooltip placement="left" title={`Reincorporar`}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  confirm({
                    title: `¿Está seguro de que desea reincorporar ${record.productName}?`,
                    icon: <WarningOutlined />,
                    content: `Serán cargados ${record.rejectedQuantity} a la sucursal ${record.originLocationName}`,
                    okText: 'CONFIRMAR',
                    cancelText: 'Cancelar',
                    async onOk() {
                      setFetching(true);
                      try {
                        const res = await transfersServices.restoreRejectedDetail(record.transferRejectedDetailId);
                        customNot('success', 'Detalle de traslado rechazado ha sido reintegrado con éxito', 'Acción terminada');
                        loadData();
                      } catch(error) {
                        
                      }
                      setFetching(false);
                    },
                    onCancel() {},
                  });
                }}
                size='small'
                icon={<GRestoreIcon width={'18px'} />}
              />
            </Tooltip>
            <Tooltip placement="top" title={`Descartar`}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  confirm({
                    title: `¿Está seguro de que desea descartar ${record.productName}?`,
                    icon: <WarningOutlined />,
                    content: `Se descartaran ${record.rejectedQuantity} `,
                    okText: 'CONFIRMAR',
                    cancelText: 'Cancelar',
                    async onOk() {
                      setFetching(true);
                      try {
                        const res = await transfersServices.discardRejectedDetail(record.transferRejectedDetailId);
                        customNot('success', 'Detalle de traslado rechazado ha sido descartado con éxito', 'Acción terminada');
                        loadData();
                      } catch(error) {
                        
                      }
                      setFetching(false);
                    },
                    onCancel() {},
                  });
                }}
                size='small'
                icon={<DeleteTwoTone twoToneColor={'#f5222d'} />}
              />
            </Tooltip>
          </Space>
        )
      }
    }
  ];

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              icon={<SyncOutlined />}
              onClick={() => loadData()}
              // size={'large'}
              >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <p style={{ fontWeight: 600, margin: '10px 0px 5px 0px' }}>Detalles de traslados rechazados</p>
        </Col>
        <Col span={24}>
          <Table 
            columns={columns}
            rowKey={'transferRejectedDetailId'}
            size={'small'}
            dataSource={entityData || []}
            loading={fetching}
            onRow={(record, index) => ({
              style: {
                background: record.rejectedDetailStatus === 2 ? '#bae0ff' : record.rejectedDetailStatus === 3 ? '#ffccc7' : 'inherit',
                // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
              }
            })}
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

export default RejectedTransfers;

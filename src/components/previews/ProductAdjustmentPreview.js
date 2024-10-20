import React, { useState, useEffect } from 'react';
import { Col, Row, Button, PageHeader, Modal, Descriptions, Table, Tag, Result } from 'antd';
import { isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';

import salesServices from '../../services/SalesServices.js';
import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import { numberToLetters } from '../../utils/NumberToLetters.js';
import { customNot } from '../../utils/Notifications.js';
import productsServices from '../../services/ProductsServices.js';
import { CloseOutlined } from '@ant-design/icons';
import { GIn2Icon, GOut2Icon } from '../../utils/IconImageProvider.js';

function ProductAdjustmentPreview(props) {
  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [wasVoided, setWasVoided] = useState(false);

  const { open, productStockAdjustmentId, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const res = await productsServices.stocks.adjustments.findById(productStockAdjustmentId);
      setEntityData(res.data);
      const detRes = await productsServices.stocks.adjustments.findDetailByAdjustmentId(productStockAdjustmentId);
      setEntityDetailData(detRes.data);
    } catch (error) {

    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, [ productStockAdjustmentId ]);

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={null}
          title={`Ajuste de Inventario #${productStockAdjustmentId}`}
          style={{ padding: 0 }}
        />
      }
      centered
      bodyStyle={{ padding: 15 }}
      width={700}
      closeIcon={<Button
        type="primary"
        danger
        icon={<CloseOutlined />}
        onClick={() => {
          setEntityData([]);
          setEntityDetailData([]);
          onClose(wasVoided);
        }}
      />}
      onCancel={() => {
        setEntityData([]);
        setEntityDetailData([]);
        onClose(wasVoided)
      }}
      maskClosable={false}
      open={open}
      footer={null}
    >
      {
        isEmpty(entityData) || isEmpty(entityDetailData) ? <Result>
          <Result
            status="warning"
            title={<p style={{ color: '#FAAD14' }}>{fetching ? 'Cargando...' : 'No se pudo obtener información de este ajuste'}</p>}
            extra={
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  onClose(wasVoided);
                }}
              >
                Cerrar
              </Button>
            }
          />
        </Result> : <Row gutter={[8, 16]}>
          <Col span={24}>
            <Descriptions
              bordered
              labelStyle={{ fontSize: 10, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              style={{ width: '100%' }}
              size={'small'}
            >
              <Descriptions.Item label="Fecha" span={3}>{entityData[0]?.adjustmentDatetimeLabel || ''}</Descriptions.Item>
              <Descriptions.Item label="Hecho por" span={3}>{entityData[0]?.adjustmentByFullName || ''}</Descriptions.Item>
              <Descriptions.Item label="Autorizado por" span={3}>{entityData[0]?.authorizedByFullName || ''}</Descriptions.Item>
              <Descriptions.Item label="Razón" span={3}>{entityData[0]?.comments || ''}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={24}>
            <Table
              bordered
              size='small'
              columns={[
                columnDef({ title: 'Cantidad', dataKey: 'quantity', fSize: 11 }),
                columnDef({title: 'Descripcion', dataKey: 'productName', fSize: 11}),
                columnDef({title: 'Costo', dataKey: 'unitCost', fSize: 11}),
                {
                  title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{''}</p>,
                  dataIndex: 'productStockAdjustmentId',
                  key: 'productStockAdjustmentId',
                  align: 'center',
                  render: (text, record, index) => {
                    return (
                      record.adjustmentType === 1 ? <GIn2Icon width={'20px'} /> : record.adjustmentType === 2 ? <GOut2Icon width={'20px'} /> : <></>
                    )
                  }
                },
              ]}
              rowKey={'productStockAdjustmentId'}
              dataSource={[
                ...entityDetailData,
              ] || []}
              // pagination={false}
              loading={fetching}
            />
          </Col>
        </Row>
      }
      <div style={{ height: '20px' }} />
    </Modal>
  )
}

export default ProductAdjustmentPreview;
